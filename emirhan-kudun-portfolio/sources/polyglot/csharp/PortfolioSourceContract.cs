namespace Seis.Portfolio.Sources;

public sealed record PortfolioSourceContract(
    string Id,
    string PluginRef,
    string Layer,
    bool VisibleInPortfolio
)
{
    public bool HasValidPluginRef => PluginRef.StartsWith("plugin://");
}
