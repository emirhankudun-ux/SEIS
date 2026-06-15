import AppKit
import WebKit

// Minimal native macOS app that shows the SEIS portfolio in a WKWebView.
//
// The site loads translations.json / site-config.json via fetch(), which the
// file:// scheme blocks, so the demo is served over http://localhost by
// run-demo.sh and the URL is injected through the Info.plist key "SEISDemoURL".
// run-demo.sh's generated Info.plist also sets NSAllowsLocalNetworking so App
// Transport Security permits the localhost load.
final class AppDelegate: NSObject, NSApplicationDelegate {
    private var window: NSWindow!
    private var webView: WKWebView!

    private func resolveURL() -> URL {
        let candidates = [
            Bundle.main.object(forInfoDictionaryKey: "SEISDemoURL") as? String,
            ProcessInfo.processInfo.environment["SEIS_DEMO_URL"],
            "http://localhost:8765/"
        ]
        for case let value? in candidates {
            if let url = URL(string: value) {
                return url
            }
        }
        return URL(string: "https://emirhankudun.com/")!
    }

    func applicationDidFinishLaunching(_ notification: Notification) {
        let frame = NSRect(x: 0, y: 0, width: 1200, height: 820)
        webView = WKWebView(frame: frame)

        window = NSWindow(
            contentRect: frame,
            styleMask: [.titled, .closable, .miniaturizable, .resizable],
            backing: .buffered,
            defer: false
        )
        window.title = "SEIS — Emirhan Kudun · macOS demo"
        window.center()
        window.contentView = webView
        window.makeKeyAndOrderFront(nil)

        webView.load(URLRequest(url: resolveURL()))

        NSApp.setActivationPolicy(.regular)
        NSApp.activate(ignoringOtherApps: true)
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        true
    }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.run()
