% SEIS Release Policy — GNU Octave
% Motion policy functions and release gate configuration

% ─── Motion Duration Function ─────────────────────────────────────────────
function ms = motion_duration_ms(token, reduced)
  % Returns duration in milliseconds for the given motion token.
  % Collapses to 0 when reduced = true.
  if nargin < 2
    reduced = false;
  end

  durations = struct( ...
    'instant',   0,   ...
    'fast',      150, ...
    'standard',  300, ...
    'slow',      500, ...
    'cinematic', 800  ...
  );

  if reduced
    ms = 0;
    return;
  end

  if isfield(durations, token)
    ms = durations.(token);
  else
    ms = durations.standard;
    warning('motion_duration_ms: unknown token "%s", defaulting to standard', token);
  end
end

% ─── Release Gate Config Struct ───────────────────────────────────────────
function gate = release_gate_config(version, status, motion_mode)
  % Returns a struct describing the release gate configuration.
  if nargin < 3
    motion_mode = 'full';
  end

  reduced = strcmp(motion_mode, 'reduced');

  gate = struct( ...
    'version',        version,                             ...
    'status',         status,                              ...
    'motion_mode',    motion_mode,                         ...
    'duration_fast',  motion_duration_ms('fast', reduced), ...
    'duration_std',   motion_duration_ms('standard', reduced), ...
    'duration_slow',  motion_duration_ms('slow', reduced), ...
    'timestamp',      datestr(now, 'yyyy-mm-dd HH:MM:SS') ...
  );
end

% ─── Can Deploy ───────────────────────────────────────────────────────────
function result = can_deploy(checks)
  % Accepts a struct array of checks with fields: name, passed.
  % Returns 'ready' if all pass, 'blocked' otherwise.
  fail_count = 0;
  for i = 1:length(checks)
    if ~checks(i).passed
      fail_count = fail_count + 1;
    end
  end

  if fail_count == 0
    result = 'ready';
  else
    result = 'blocked';
  end
end

% ─── Print Release Gate Report ────────────────────────────────────────────
function print_gate_report(gate, checks)
  fprintf('\nSEIS Release Gate — %s\n', gate.version);
  fprintf('%s\n', repmat('-', 1, 40));
  fprintf('Status:      %s\n', upper(gate.status));
  fprintf('Motion mode: %s\n', gate.motion_mode);
  fprintf('Fast:        %dms\n', gate.duration_fast);
  fprintf('Standard:    %dms\n', gate.duration_std);
  fprintf('%s\n', repmat('-', 1, 40));

  for i = 1:length(checks)
    if checks(i).passed
      marker = 'PASS';
    else
      marker = 'FAIL';
    end
    fprintf('  [%s]  %s\n', marker, checks(i).name);
  end
  fprintf('%s\n', repmat('-', 1, 40));
end

% ─── Main Execution ───────────────────────────────────────────────────────
% Build sample checks
checks(1) = struct('name', 'typecheck', 'passed', true);
checks(2) = struct('name', 'lint', 'passed', true);
checks(3) = struct('name', 'content validation', 'passed', true);
checks(4) = struct('name', 'accessibility audit', 'passed', false);

status = can_deploy(checks);
gate = release_gate_config('v2.4.0', status, 'full');
print_gate_report(gate, checks);
