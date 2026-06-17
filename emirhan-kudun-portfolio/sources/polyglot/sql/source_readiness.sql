create table if not exists portfolio_source_readiness (
  source_id text primary key,
  plugin_ref text not null,
  layer text not null,
  visible_in_portfolio boolean not null default true,
  requires_credentials boolean not null default false
);

create view portfolio_source_readiness_public as
select
  source_id,
  plugin_ref,
  layer,
  case
    when visible_in_portfolio and not requires_credentials then 'ready'
    when visible_in_portfolio and requires_credentials then 'credential_gated'
    else 'hidden'
  end as readiness_state
from portfolio_source_readiness;
