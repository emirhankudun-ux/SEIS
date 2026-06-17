//! SEIS link audit — verifies every *local* reference in index.html and
//! style.css resolves to a real file on disk. Catches renamed icons,
//! deleted fonts, or typoed asset paths that the JS audit suite does not
//! cover (drawings_catalog only checks the drawings directory).
//!
//! Usage: seis-link-audit [web-root]   (default: apps/web relative to cwd)
//! Exit:  0 all local references resolve · 1 missing files · 2 IO error

use std::env;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::ExitCode;

/// Attribute names whose values are references worth checking in HTML.
const HTML_ATTRS: [&str; 4] = ["href", "src", "data-src", "content"];

/// A reference is external (skipped) when it has a scheme, is an anchor,
/// a template placeholder, or inline data.
fn is_external(value: &str) -> bool {
    value.is_empty()
        || value.starts_with('#')
        || value.starts_with("http://")
        || value.starts_with("https://")
        || value.starts_with("//")
        || value.starts_with("mailto:")
        || value.starts_with("tel:")
        || value.starts_with("data:")
        || value.starts_with('{')
}

/// Only values that look like a checkable asset path are audited; this
/// filters meta content= free text ("width=device-width, …", descriptions).
fn looks_like_asset_path(value: &str) -> bool {
    const EXTS: [&str; 17] = [
        ".png", ".jpg", ".jpeg", ".webp", ".svg", ".ico", ".gif", ".css",
        ".js", ".mjs", ".json", ".webmanifest", ".xml", ".txt", ".woff",
        ".woff2", ".pdf",
    ];
    if value.contains(char::is_whitespace) || value.contains(',') {
        return false;
    }
    let lower = value.to_ascii_lowercase();
    EXTS.iter().any(|ext| lower.ends_with(ext))
}

/// Strip query string and fragment from a local reference.
fn strip_query(value: &str) -> &str {
    let end = value.find(['?', '#']).unwrap_or(value.len());
    &value[..end]
}

/// Extract `attr="value"` pairs for the attributes we audit.
fn extract_html_refs(html: &str) -> Vec<String> {
    let mut refs = Vec::new();
    for attr in HTML_ATTRS {
        let needle = format!("{attr}=\"");
        let mut rest = html;
        while let Some(pos) = rest.find(&needle) {
            let after = &rest[pos + needle.len()..];
            if let Some(end) = after.find('"') {
                refs.push(after[..end].to_string());
                rest = &after[end..];
            } else {
                break;
            }
        }
    }
    refs
}

/// Extract "src": "value" entries from manifest.json (icons, screenshots)
/// without a JSON parser — the manifest format is fixed and flat enough.
fn extract_manifest_refs(json: &str) -> Vec<String> {
    let mut refs = Vec::new();
    let mut rest = json;
    while let Some(pos) = rest.find("\"src\"") {
        let after = &rest[pos + 5..];
        let after = after.trim_start().strip_prefix(':').unwrap_or(after).trim_start();
        if let Some(stripped) = after.strip_prefix('"') {
            if let Some(end) = stripped.find('"') {
                refs.push(stripped[..end].to_string());
                rest = &stripped[end..];
                continue;
            }
        }
        rest = after;
    }
    refs
}

/// Extract url(...) references from CSS, tolerating quotes and whitespace.
fn extract_css_refs(css: &str) -> Vec<String> {
    let mut refs = Vec::new();
    let mut rest = css;
    while let Some(pos) = rest.find("url(") {
        let after = &rest[pos + 4..];
        if let Some(end) = after.find(')') {
            let raw = after[..end].trim().trim_matches(['"', '\'']).trim();
            refs.push(raw.to_string());
            rest = &after[end..];
        } else {
            break;
        }
    }
    refs
}

struct Report {
    checked: usize,
    external: usize,
    missing: Vec<String>,
}

fn audit(web_root: &Path) -> Result<Report, String> {
    let html_path = web_root.join("index.html");
    let html = fs::read_to_string(&html_path)
        .map_err(|e| format!("cannot read {}: {e}", html_path.display()))?;
    let css = fs::read_to_string(web_root.join("style.css")).unwrap_or_default();
    let manifest = fs::read_to_string(web_root.join("manifest.json")).unwrap_or_default();

    let mut candidates = extract_html_refs(&html);
    candidates.extend(extract_css_refs(&css));
    candidates.extend(extract_manifest_refs(&manifest));

    let mut report = Report { checked: 0, external: 0, missing: Vec::new() };
    let mut seen = std::collections::BTreeSet::new();

    for value in candidates {
        if is_external(&value) {
            report.external += 1;
            continue;
        }
        let local = strip_query(&value).trim_start_matches("./").to_string();
        if !looks_like_asset_path(&local) {
            continue;
        }
        if !seen.insert(local.clone()) {
            continue;
        }
        report.checked += 1;
        let on_disk = web_root.join(local.trim_start_matches('/'));
        if !on_disk.is_file() {
            report.missing.push(local);
        }
    }
    Ok(report)
}

fn main() -> ExitCode {
    let arg = env::args().nth(1);
    let web_root: PathBuf = arg.map(PathBuf::from).unwrap_or_else(|| PathBuf::from("apps/web"));

    match audit(&web_root) {
        Ok(report) => {
            let mark = if report.missing.is_empty() { "PASS" } else { "FAIL" };
            println!(
                "[{mark}] link-audit  {} local refs checked, {} external skipped",
                report.checked, report.external
            );
            for path in &report.missing {
                println!("        missing on disk: {path}");
            }
            if report.missing.is_empty() { ExitCode::SUCCESS } else { ExitCode::from(1) }
        }
        Err(message) => {
            eprintln!("seis-link-audit: {message}");
            ExitCode::from(2)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;

    #[test]
    fn external_classification() {
        assert!(is_external("https://example.com/x.css"));
        assert!(is_external("mailto:a@b.c"));
        assert!(is_external("#section"));
        assert!(is_external("data:image/png;base64,xx"));
        assert!(!is_external("style.css"));
        assert!(!is_external("public/media/drawings/karakalem-01.jpg"));
    }

    #[test]
    fn asset_path_gate_filters_meta_free_text() {
        assert!(looks_like_asset_path("icons/icon-192.png"));
        assert!(looks_like_asset_path("style.css"));
        assert!(!looks_like_asset_path("width=device-width, initial-scale=1.0"));
        assert!(!looks_like_asset_path("Istanbul based designer. Global projects."));
        assert!(!looks_like_asset_path("summary_large_image"));
    }

    #[test]
    fn manifest_src_extraction() {
        let json = r#"{"icons":[{"src": "icons/icon-192.png","sizes":"192x192"},
                       {"src":"icons/icon-512.png"}]}"#;
        let refs = extract_manifest_refs(json);
        assert_eq!(refs, vec!["icons/icon-192.png", "icons/icon-512.png"]);
    }

    #[test]
    fn query_and_fragment_stripped() {
        assert_eq!(strip_query("style.css?v=20260609-2"), "style.css");
        assert_eq!(strip_query("script.js#main"), "script.js");
        assert_eq!(strip_query("plain.svg"), "plain.svg");
    }

    #[test]
    fn html_attribute_extraction() {
        let html = r#"<link href="style.css"><img src="a.jpg" data-src="b.jpg">
                      <meta content="cover.png">"#;
        let refs = extract_html_refs(html);
        assert!(refs.contains(&"style.css".to_string()));
        assert!(refs.contains(&"a.jpg".to_string()));
        assert!(refs.contains(&"b.jpg".to_string()));
        assert!(refs.contains(&"cover.png".to_string()));
    }

    #[test]
    fn css_url_extraction() {
        let css = r#"body { background: url("bg.webp"); }
                     .x { mask: url( 'icons/star.svg' ); }
                     .y { cursor: url(data:image/png;base64,zz); }"#;
        let refs = extract_css_refs(css);
        assert!(refs.contains(&"bg.webp".to_string()));
        assert!(refs.contains(&"icons/star.svg".to_string()));
        assert!(refs.iter().any(|r| r.starts_with("data:")));
    }

    #[test]
    fn audit_passes_when_files_exist() {
        let dir = std::env::temp_dir().join(format!("seis-link-{}", std::process::id()));
        fs::create_dir_all(&dir).unwrap();
        fs::write(dir.join("index.html"), r#"<link href="style.css?v=1"><img src="logo.png">"#).unwrap();
        fs::write(dir.join("style.css"), "body{}").unwrap();
        fs::write(dir.join("logo.png"), [0u8; 4]).unwrap();
        let report = audit(&dir).unwrap();
        assert!(report.missing.is_empty());
        assert_eq!(report.checked, 2);
        fs::remove_dir_all(&dir).unwrap();
    }

    #[test]
    fn audit_reports_missing_files() {
        let dir = std::env::temp_dir().join(format!("seis-link-miss-{}", std::process::id()));
        fs::create_dir_all(&dir).unwrap();
        fs::write(dir.join("index.html"), r#"<img src="ghost.jpg">"#).unwrap();
        let report = audit(&dir).unwrap();
        assert_eq!(report.missing, vec!["ghost.jpg".to_string()]);
        fs::remove_dir_all(&dir).unwrap();
    }
}
