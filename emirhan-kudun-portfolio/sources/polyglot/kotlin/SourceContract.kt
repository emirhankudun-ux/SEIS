package seis.portfolio.sources

data class SourceContract(
    val id: String,
    val pluginRef: String,
    val layer: String,
    val visibleInPortfolio: Boolean
) {
    val hasValidPluginRef: Boolean
        get() = pluginRef.startsWith("plugin://")
}
