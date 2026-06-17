package seis.portfolio.sources;

public record PortfolioSourceContract(
    String id,
    String pluginRef,
    String layer,
    boolean visibleInPortfolio
) {
    public boolean hasValidPluginRef() {
        return pluginRef != null && pluginRef.startsWith("plugin://");
    }
}
