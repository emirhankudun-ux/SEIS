package portfolio

type SourceStatus string

const (
	SourceLive     SourceStatus = "live"
	SourceContract SourceStatus = "contract"
	SourceBlocked  SourceStatus = "blocked"
)

type PortfolioSourceManifest struct {
	ID        string
	Label     string
	PluginRef string
	Layer     string
	Status    SourceStatus
}

func (source PortfolioSourceManifest) Renderable() bool {
	return source.PluginRef != "" && source.Status != SourceBlocked
}
