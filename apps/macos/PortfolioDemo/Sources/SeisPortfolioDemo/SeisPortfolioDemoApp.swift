import SwiftUI
import WebKit
import AppKit

// A small, polished native macOS app that presents the SEIS portfolio
// (apps/web) inside a SwiftUI shell: a unified toolbar with back / forward /
// reload / open-in-browser, loading and error states, and the site's dark
// brand theme.
//
// The site loads translations.json / site-config.json via fetch(), so it is
// served over http://localhost by run-demo.sh; the URL and an ATS
// NSAllowsLocalNetworking exception are injected through the .app Info.plist.

// MARK: - Configuration

enum DemoConfig {
    /// Resolution order: Info.plist (set by run-demo.sh) → env → localhost → live site.
    static var url: URL {
        let candidates = [
            Bundle.main.object(forInfoDictionaryKey: "SEISDemoURL") as? String,
            ProcessInfo.processInfo.environment["SEIS_DEMO_URL"],
            "http://localhost:8765/"
        ]
        for case let value? in candidates {
            if let url = URL(string: value) { return url }
        }
        return URL(string: "https://emirhankudun.com/")!
    }

    // Brand palette — mirrors apps/web/style.css (:root).
    static let background = Color(red: 0.039, green: 0.039, blue: 0.039) // #0a0a0a
    static let accent = Color(red: 0.784, green: 0.663, blue: 0.431)     // #c8a96e
    static let backgroundNSColor = NSColor(red: 0.039, green: 0.039, blue: 0.039, alpha: 1)
}

// MARK: - Web view model

final class WebViewModel: NSObject, ObservableObject, WKNavigationDelegate {
    let webView: WKWebView
    @Published var isLoading = true
    @Published var canGoBack = false
    @Published var canGoForward = false
    @Published var pageTitle = "SEIS — Emirhan Kudun"
    @Published var failed = false

    private let homeURL = DemoConfig.url

    override init() {
        webView = WKWebView(frame: .zero, configuration: WKWebViewConfiguration())
        super.init()
        webView.navigationDelegate = self
        webView.allowsBackForwardNavigationGestures = true
        webView.underPageBackgroundColor = DemoConfig.backgroundNSColor
        load()
    }

    func load() {
        failed = false
        isLoading = true
        webView.load(URLRequest(url: homeURL))
    }

    func reload() {
        if webView.url == nil {
            load()
        } else {
            failed = false
            isLoading = true
            webView.reload()
        }
    }

    func goBack() { webView.goBack() }
    func goForward() { webView.goForward() }

    var currentURL: URL { webView.url ?? homeURL }

    private func refreshNavState() {
        canGoBack = webView.canGoBack
        canGoForward = webView.canGoForward
    }

    func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
        isLoading = true
        failed = false
        refreshNavState()
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        isLoading = false
        refreshNavState()
        if let title = webView.title, !title.isEmpty { pageTitle = title }
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        isLoading = false
        failed = true
        refreshNavState()
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        isLoading = false
        failed = true
        refreshNavState()
    }
}

// MARK: - WKWebView bridge

struct WebView: NSViewRepresentable {
    let webView: WKWebView
    func makeNSView(context: Context) -> WKWebView { webView }
    func updateNSView(_ nsView: WKWebView, context: Context) {}
}

// MARK: - UI

struct ContentView: View {
    @ObservedObject var model: WebViewModel
    @Environment(\.openURL) private var openInBrowser

    var body: some View {
        ZStack {
            DemoConfig.background.ignoresSafeArea()

            WebView(webView: model.webView)
                .opacity(model.failed ? 0 : 1)

            if model.isLoading && !model.failed {
                ProgressView()
                    .controlSize(.large)
                    .tint(DemoConfig.accent)
            }

            if model.failed {
                errorOverlay
            }
        }
        .navigationTitle(model.pageTitle)
        .toolbar {
            ToolbarItemGroup(placement: .navigation) {
                Button(action: model.goBack) { Image(systemName: "chevron.backward") }
                    .disabled(!model.canGoBack)
                    .help("Back")
                Button(action: model.goForward) { Image(systemName: "chevron.forward") }
                    .disabled(!model.canGoForward)
                    .help("Forward")
                Button(action: model.reload) { Image(systemName: "arrow.clockwise") }
                    .help("Reload")
            }
            ToolbarItem(placement: .primaryAction) {
                Button { openInBrowser(model.currentURL) } label: { Image(systemName: "safari") }
                    .help("Open in browser")
            }
        }
    }

    private var errorOverlay: some View {
        VStack(spacing: 16) {
            Image(systemName: "wifi.exclamationmark")
                .font(.system(size: 42, weight: .light))
                .foregroundColor(DemoConfig.accent)
            Text("Couldn't load the portfolio")
                .font(.title3.weight(.semibold))
                .foregroundColor(.white)
            Text("Make sure the local server is running —\nrun-demo.sh starts it automatically.")
                .multilineTextAlignment(.center)
                .foregroundColor(.secondary)
            Button("Try again", action: model.load)
                .buttonStyle(.borderedProminent)
                .tint(DemoConfig.accent)
        }
        .padding(40)
    }
}

// MARK: - App

final class AppDelegate: NSObject, NSApplicationDelegate {
    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.regular)
        NSApp.activate(ignoringOtherApps: true)
    }
    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { true }
}

@main
struct SeisPortfolioDemoApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate
    @StateObject private var model = WebViewModel()

    var body: some Scene {
        WindowGroup {
            ContentView(model: model)
                .frame(minWidth: 900, idealWidth: 1200, minHeight: 600, idealHeight: 820)
                .preferredColorScheme(.dark)
        }
        .windowToolbarStyle(.unified)
        .commands {
            CommandGroup(replacing: .newItem) {}
            CommandMenu("Navigate") {
                Button("Reload", action: model.reload)
                    .keyboardShortcut("r", modifiers: .command)
                Divider()
                Button("Back", action: model.goBack)
                    .keyboardShortcut("[", modifiers: .command)
                    .disabled(!model.canGoBack)
                Button("Forward", action: model.goForward)
                    .keyboardShortcut("]", modifiers: .command)
                    .disabled(!model.canGoForward)
            }
        }
    }
}
