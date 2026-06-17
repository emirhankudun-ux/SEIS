// SEIS Release Policy — Scilab
// Motion policy functions and release gate configuration

// ─── Motion Duration Function ──────────────────────────────────────────────
function ms = motion_duration_ms(token, reduced)
    // Returns duration in milliseconds for the given token.
    // Collapses to 0 when reduced = %T.
    if ~exists('reduced', 'local') then
        reduced = %F;
    end

    select token
    case 'instant'   then base = 0
    case 'fast'      then base = 150
    case 'standard'  then base = 300
    case 'slow'      then base = 500
    case 'cinematic' then base = 800
    else
        base = 300;
        mprintf('[WARNING] Unknown motion token: %s — defaulting to standard\n', token);
    end

    if reduced then
        ms = 0;
    else
        ms = base;
    end
endfunction

// ─── Release Gate Config ───────────────────────────────────────────────────
function gate = release_gate_config(version, motion_mode)
    if ~exists('motion_mode', 'local') then
        motion_mode = 'full';
    end

    reduced = (motion_mode == 'reduced');

    gate = struct();
    gate.version       = version;
    gate.motion_mode   = motion_mode;
    gate.duration_fast = motion_duration_ms('fast',     reduced);
    gate.duration_std  = motion_duration_ms('standard', reduced);
    gate.duration_slow = motion_duration_ms('slow',     reduced);
endfunction

// ─── Can Deploy ───────────────────────────────────────────────────────────
function status = can_deploy(check_names, check_results)
    // check_names: list of strings
    // check_results: boolean vector (1 = pass, 0 = fail)
    fail_count = sum(check_results == 0);
    if fail_count == 0 then
        status = 'ready';
    else
        status = 'blocked';
    end
endfunction

// ─── Print Gate Report ────────────────────────────────────────────────────
function print_gate_report(gate, check_names, check_results, status)
    mprintf('\nSEIS Release Gate — %s\n', gate.version);
    mprintf('%s\n', strcat(repmat('-', 1, 40)));
    mprintf('Status:      %s\n', convstr(status, 'u'));
    mprintf('Motion mode: %s\n', gate.motion_mode);
    mprintf('Fast:        %dms\n', gate.duration_fast);
    mprintf('Standard:    %dms\n', gate.duration_std);
    mprintf('%s\n', strcat(repmat('-', 1, 40)));

    for i = 1:length(check_names)
        if check_results(i) == 1 then
            marker = 'PASS';
        else
            marker = 'FAIL';
        end
        mprintf('  [%s]  %s\n', marker, check_names(i));
    end
    mprintf('%s\n', strcat(repmat('-', 1, 40)));
endfunction

// ─── Main Execution ───────────────────────────────────────────────────────
check_names   = list('typecheck', 'lint', 'content validation', 'accessibility');
check_results = [1, 1, 1, 0];  // 1 = pass, 0 = fail

status = can_deploy(check_names, matrix(check_results, 1, -1));
gate   = release_gate_config('v2.4.0', 'full');
print_gate_report(gate, check_names, check_results, status);
