export type PluginSourceDashboardTechnology = {
  id: string;
  label: string;
  runtimeRole: string;
  primaryLane: string;
};

export type PluginSourceDashboardProps = {
  technologies: PluginSourceDashboardTechnology[];
  uniquePlugins: number;
  laneCount: number;
};

export function PluginSourceDashboard({
  technologies,
  uniquePlugins,
  laneCount
}: PluginSourceDashboardProps) {
  return (
    <section aria-labelledby="plugin-source-dashboard-title">
      <h2 id="plugin-source-dashboard-title">Plugin source stack</h2>
      <p>
        {uniquePlugins} plugins mapped across {laneCount} capability lanes.
      </p>
      <ul>
        {technologies.map((technology) => (
          <li key={technology.id}>
            <strong>{technology.label}</strong>
            <span>{technology.runtimeRole}</span>
            <small>{technology.primaryLane}</small>
          </li>
        ))}
      </ul>
    </section>
  );
}
