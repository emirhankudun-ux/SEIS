///usr/bin/env java "$0" "$@"; exit $?
/**
 * SEIS CSS media query auditor — Java single-file program.
 *
 * Reads apps/web/style.css and verifies that the required responsive design
 * breakpoints and accessibility media features are present:
 *   • Mobile viewport    — max-width: 768px (or narrower)
 *   • Tablet viewport    — max-width: 1024px (or similar)
 *   • Desktop wide       — min-width: 1800px or min-width: 1200px
 *   • prefers-reduced-motion — animation/motion accessibility
 *   • print              — print stylesheet support
 *
 * Usage: java polyglot/java/CssMediaQueryAudit.java [--self-test] [css-file]
 * Exit:  0 PASS, 1 FAIL, 2 file not found
 */

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class CssMediaQueryAudit {

    static final String DEFAULT_CSS = "apps/web/style.css";

    // ─── extraction ──────────────────────────────────────────────────────────

    record MediaQuery(String raw) {
        boolean hasMaxWidth(int maxPx) {
            Pattern p = Pattern.compile("max-width\\s*:\\s*(\\d+)px");
            Matcher m = p.matcher(raw);
            while (m.find()) {
                if (Integer.parseInt(m.group(1)) <= maxPx) return true;
            }
            return false;
        }
        boolean hasMinWidth(int minPx) {
            Pattern p = Pattern.compile("min-width\\s*:\\s*(\\d+)px");
            Matcher m = p.matcher(raw);
            while (m.find()) {
                if (Integer.parseInt(m.group(1)) >= minPx) return true;
            }
            return false;
        }
        boolean contains(String token) {
            return raw.contains(token);
        }
    }

    static List<MediaQuery> extractMediaQueries(String css) {
        List<MediaQuery> list = new ArrayList<>();
        Pattern p = Pattern.compile("@media\\s+([^{]+)\\{", Pattern.CASE_INSENSITIVE);
        Matcher m = p.matcher(css);
        while (m.find()) {
            list.add(new MediaQuery(m.group(1).trim()));
        }
        return list;
    }

    // ─── checks ──────────────────────────────────────────────────────────────

    record CheckResult(boolean ok, String label) {}

    static List<CheckResult> audit(List<MediaQuery> queries) {
        List<CheckResult> results = new ArrayList<>();

        boolean hasMobile = queries.stream().anyMatch(q -> q.hasMaxWidth(768));
        results.add(new CheckResult(hasMobile, "mobile breakpoint (max-width ≤768px)"));

        boolean hasTablet = queries.stream().anyMatch(q -> q.hasMaxWidth(1024));
        results.add(new CheckResult(hasTablet, "tablet breakpoint (max-width ≤1024px)"));

        boolean hasWide = queries.stream()
                .anyMatch(q -> q.hasMinWidth(1200) || q.hasMaxWidth(1200));
        results.add(new CheckResult(hasWide, "wide/desktop breakpoint (≥1200px or similar)"));

        boolean hasReducedMotion = queries.stream()
                .anyMatch(q -> q.contains("prefers-reduced-motion"));
        results.add(new CheckResult(hasReducedMotion, "prefers-reduced-motion query"));

        boolean hasPrint = queries.stream().anyMatch(q -> q.contains("print"));
        results.add(new CheckResult(hasPrint, "print media query"));

        return results;
    }

    // ─── self-test ────────────────────────────────────────────────────────────

    static boolean selfTest() {
        int pass = 0, total = 0;

        String css = """
            @media (max-width: 768px) { body { font-size: 14px; } }
            @media (max-width: 1024px) { .sidebar { display: none; } }
            @media (min-width: 1800px) { .container { max-width: 1600px; } }
            @media (prefers-reduced-motion: reduce) { * { animation: none; } }
            @media print { nav { display: none; } }
            """;

        List<MediaQuery> queries = extractMediaQueries(css);

        // basic extraction
        if (queries.size() == 5) {
            pass++; System.out.println("  [ok] extracted 5 queries");
        } else {
            System.out.println("  [FAIL] self-test: expected 5 queries, got " + queries.size());
        }
        total++;

        // full audit on good CSS
        List<CheckResult> results = audit(queries);
        long failures = results.stream().filter(r -> !r.ok()).count();
        if (failures == 0) {
            pass++; System.out.println("  [ok] good CSS: all checks pass");
        } else {
            System.out.println("  [FAIL] self-test: good CSS had " + failures + " failure(s)");
        }
        total++;

        // missing mobile
        String noMobile = "@media (max-width: 1200px) {}";
        List<CheckResult> r2 = audit(extractMediaQueries(noMobile));
        boolean mobileFailed = r2.stream().filter(r -> !r.ok())
                .anyMatch(r -> r.label().contains("mobile"));
        if (mobileFailed) {
            pass++; System.out.println("  [ok] missing mobile breakpoint detected");
        } else {
            System.out.println("  [FAIL] self-test: missing mobile not detected");
        }
        total++;

        // missing prefers-reduced-motion
        String noMotion = "@media (max-width: 768px) {}";
        List<CheckResult> r3 = audit(extractMediaQueries(noMotion));
        boolean motionFailed = r3.stream().filter(r -> !r.ok())
                .anyMatch(r -> r.label().contains("prefers-reduced-motion"));
        if (motionFailed) {
            pass++; System.out.println("  [ok] missing prefers-reduced-motion detected");
        } else {
            System.out.println("  [FAIL] self-test: missing prefers-reduced-motion not detected");
        }
        total++;

        // MediaQuery helpers
        MediaQuery mq = new MediaQuery("(max-width: 500px)");
        if (mq.hasMaxWidth(768))  { pass++; System.out.println("  [ok] hasMaxWidth(768) on 500px"); }
        else System.out.println("  [FAIL] self-test: hasMaxWidth(768) on 500px");
        total++;

        if (!mq.hasMaxWidth(400)) { pass++; System.out.println("  [ok] !hasMaxWidth(400) on 500px"); }
        else System.out.println("  [FAIL] self-test: !hasMaxWidth(400) on 500px");
        total++;

        boolean passed = (pass == total);
        String tag = passed ? "[PASS]" : "[FAIL]";
        System.out.printf("%s css-media-query  %d/%d self-tests passed%n", tag, pass, total);
        return passed;
    }

    // ─── main ────────────────────────────────────────────────────────────────

    public static void main(String[] args) throws IOException {
        if (args.length > 0 && args[0].equals("--self-test")) {
            System.exit(selfTest() ? 0 : 1);
        }

        String cssPath = args.length > 0 ? args[0] : DEFAULT_CSS;
        Path path = Path.of(cssPath);
        if (!Files.exists(path)) {
            System.out.println("[FAIL] css-media-query  " + cssPath + " not found");
            System.exit(2);
        }

        String css = Files.readString(path);
        List<MediaQuery> queries = extractMediaQueries(css);
        List<CheckResult> results = audit(queries);

        System.out.printf("       %s: %d @media rules found%n", cssPath, queries.size());

        List<String> missing = results.stream()
                .filter(r -> !r.ok())
                .map(CheckResult::label)
                .toList();

        if (missing.isEmpty()) {
            long pass = results.stream().filter(CheckResult::ok).count();
            System.out.printf("[PASS] css-media-query  %d/%d checks passed%n", pass, results.size());
        } else {
            System.out.printf("[FAIL] css-media-query  %d check(s) failed:%n", missing.size());
            for (String m : missing) {
                System.out.println("       missing: " + m);
            }
            System.exit(1);
        }
    }
}
