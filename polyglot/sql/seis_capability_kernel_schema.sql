create table if not exists seis_capability_domain (
  domain_id text primary key,
  label text not null,
  lane text not null,
  agent_role text not null,
  purpose text not null,
  plugin_count integer not null check (plugin_count >= 3),
  quality_gate_count integer not null check (quality_gate_count >= 5),
  created_at text not null default current_timestamp
);

create table if not exists seis_capability_plugin_hint (
  domain_id text not null references seis_capability_domain(domain_id),
  plugin_name text not null,
  plugin_group text not null,
  activation_policy text not null default 'task_relevant_authenticated_scoped_user_approved',
  primary key (domain_id, plugin_name)
);

create table if not exists seis_capability_quality_gate (
  domain_id text not null references seis_capability_domain(domain_id),
  gate_name text not null,
  severity text not null check (severity in ('required', 'recommended', 'optional')),
  primary key (domain_id, gate_name)
);

create view if not exists seis_capability_readiness as
select
  domain_id,
  lane,
  agent_role,
  plugin_count,
  quality_gate_count,
  case
    when plugin_count >= 3 and quality_gate_count >= 5 then 'ready'
    else 'blocked'
  end as readiness
from seis_capability_domain;
