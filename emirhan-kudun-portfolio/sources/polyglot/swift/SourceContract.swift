struct SourceContract: Hashable {
    let id: String
    let pluginRef: String
    let layer: String
    let visibleInPortfolio: Bool

    var hasValidPluginRef: Bool {
        pluginRef.hasPrefix("plugin://")
    }
}
