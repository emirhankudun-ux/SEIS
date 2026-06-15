* SEIS Release Policy — Stata

* Define motion mode constants (local macros)
local CINEMATIC "cinematic"
local BALANCED  "balanced"
local REDUCED   "reduced"

* Build motion duration dataset
clear
input str20 mode int duration_ms
"cinematic" 600
"balanced"  300
"reduced"     0
end

label variable mode        "Motion Mode"
label variable duration_ms "Duration (ms)"

* Build release gate dataset
preserve
clear
input str20 status byte can_deploy
"ready"   1
"blocked" 0
"pending" 0
end
label variable status     "Release Status"
label variable can_deploy "Can Deploy"
list
restore

* Resolve motion mode
local prefers_reduced = 1
local requested       = "`CINEMATIC'"

if `prefers_reduced' == 1 {
    local resolved = "`REDUCED'"
}
else {
    local resolved = "`requested'"
}
display "Resolved mode: `resolved'"

* Lookup duration
quietly levelsof duration_ms if mode == "`resolved'", local(dur)
display "Duration ms: `dur'"
