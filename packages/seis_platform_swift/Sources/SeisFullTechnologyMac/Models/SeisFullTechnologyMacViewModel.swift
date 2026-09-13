import Combine
import Foundation
import SeisPlatformKit

@MainActor
final class SeisFullTechnologyMacViewModel: ObservableObject {
    @Published private(set) var store = SeisFullTechnologyNativeStore()
    @Published private(set) var query = ""

    private let repositoryURL: URL

    init(repositoryURL: URL = SeisFullTechnologyMacViewModel.defaultRepositoryURL()) {
        self.repositoryURL = repositoryURL
    }

    var explorerState: SeisFullTechnologyExplorerState? {
        store.explorerState
    }

    var failure: SeisFullTechnologyNativeFailure? {
        store.failure
    }

    func load() {
        var nextStore = store
        nextStore.load(startingAt: repositoryURL)
        store = nextStore
        query = nextStore.explorerState?.query ?? ""
    }

    func updateQuery(_ newQuery: String) {
        query = newQuery
        var nextStore = store
        nextStore.updateQuery(newQuery)
        store = nextStore
    }

    func selectDomain(id: String) {
        var nextStore = store
        guard nextStore.selectDomain(id: id) else { return }
        store = nextStore
    }

    private static func defaultRepositoryURL() -> URL {
        let arguments = Array(CommandLine.arguments.dropFirst())
        if let flagIndex = arguments.firstIndex(of: "--repository-root"),
           arguments.indices.contains(flagIndex + 1) {
            return URL(fileURLWithPath: arguments[flagIndex + 1], isDirectory: true)
        }

        if let positionalPath = arguments.first(where: { $0.hasPrefix("-") == false }) {
            return URL(fileURLWithPath: positionalPath, isDirectory: true)
        }

        return URL(
            fileURLWithPath: FileManager.default.currentDirectoryPath,
            isDirectory: true
        )
    }
}
