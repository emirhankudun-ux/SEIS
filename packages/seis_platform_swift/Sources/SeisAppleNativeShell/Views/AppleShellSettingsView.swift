import SeisPlatformKit
import SwiftUI

struct AppleShellSettingsView: View {
    @AppStorage(SeisAppleShellSettingsContract.appleNativeShell.lowMotionKey)
    private var lowMotion = SeisAppleShellSettingsContract.appleNativeShell.defaultLowMotion

    @AppStorage(SeisAppleShellSettingsContract.appleNativeShell.preferredFocusKey)
    private var preferredFocus = SeisAppleShellSettingsContract.appleNativeShell.defaultPreferredFocus.rawValue

    @AppStorage(SeisAppleShellSettingsContract.appleNativeShell.showsQualityGatesKey)
    private var showsQualityGates = SeisAppleShellSettingsContract.appleNativeShell.defaultShowsQualityGates

    var body: some View {
        TabView {
            Form {
                Picker("Preferred Focus", selection: $preferredFocus) {
                    ForEach(SeisAppleShellFocusPreference.allCases, id: \.rawValue) { focus in
                        Text(label(for: focus))
                            .tag(focus.rawValue)
                    }
                }
                Toggle("Low Motion", isOn: $lowMotion)
                Toggle("Quality Gates", isOn: $showsQualityGates)
            }
            .padding()
            .tabItem {
                Label("General", systemImage: "gearshape")
            }
        }
        .frame(width: 460, height: 260)
    }

    private func label(for focus: SeisAppleShellFocusPreference) -> String {
        switch focus {
        case .appleNative:
            "Apple Native"
        case .macOS:
            "macOS"
        case .iOS:
            "iOS"
        }
    }
}
