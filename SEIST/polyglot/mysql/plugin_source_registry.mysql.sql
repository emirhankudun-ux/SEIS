create table if not exists seis_plugin_source_registry (
  plugin_id varchar(160) not null,
  plugin_uri varchar(768) not null,
  source_name varchar(160) not null,
  primary_lane varchar(160) not null,
  activation_status varchar(80) not null default 'submitted-not-activated',
  created_at timestamp not null default current_timestamp,
  primary key (plugin_id),
  unique key uq_seis_plugin_source_registry_uri (plugin_uri),
  key idx_seis_plugin_source_registry_lane (primary_lane),
  key idx_seis_plugin_source_registry_source (source_name)
) engine = InnoDB
  default charset = utf8mb4
  collate = utf8mb4_unicode_ci;

create table if not exists seis_requested_software_stack (
  technology_id varchar(80) not null,
  technology_label varchar(120) not null,
  runtime_role text not null,
  primary_lane varchar(160) not null,
  source_path varchar(512) not null,
  created_at timestamp not null default current_timestamp,
  primary key (technology_id),
  key idx_seis_requested_software_stack_lane (primary_lane)
) engine = InnoDB
  default charset = utf8mb4
  collate = utf8mb4_unicode_ci;
