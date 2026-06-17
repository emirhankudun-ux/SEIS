create table if not exists seis_release_ledger (
  id text primary key,
  package_path text not null,
  package_bytes integer not null check (package_bytes > 0),
  sha256 text not null check (length(sha256) = 64),
  active_target text,
  live_upload_blocked boolean not null default true,
  created_at text not null
);

create index if not exists idx_seis_release_ledger_created_at
  on seis_release_ledger (created_at);
