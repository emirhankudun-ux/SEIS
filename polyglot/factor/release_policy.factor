! SEIS Release Policy — Factor (Concatenative Language)
! Motion policy and deploy gate using Factor's stack-based word definitions

USING: kernel io strings sequences math assocs hashtables
       prettyprint formatting arrays ;
IN: seis.release

! ─── Motion Duration Table ───────────────────────────────────────────────
: motion-durations ( -- assoc )
    H{
        { "instant"   0   }
        { "fast"      150 }
        { "standard"  300 }
        { "slow"      500 }
        { "cinematic" 800 }
    } ;

! ─── Motion Duration Ms ─────────────────────────────────────────────────
! ( token mode -- ms )
! Stack: token mode → ms (int)
: motion-duration-ms ( token mode -- ms )
    dup { "reduced" "manual-low" } member?
    [ 2drop 0 ]
    [ drop motion-durations ?at [ drop 300 ] unless ]
    if ;

! ─── Gate Status ──────────────────────────────────────────────────────────
! ( checks -- status )
! checks is a sequence of { name passed } pairs
: count-failures ( checks -- n )
    [ second not ] count ;

: gate-status ( checks -- status )
    count-failures zero?
    "ready" "blocked" ? ;

! ─── Can Deploy ───────────────────────────────────────────────────────────
: can-deploy? ( checks -- ? )
    gate-status "ready" = ;

! ─── Status Label ────────────────────────────────────────────────────────
: status-label ( status -- label )
    >upper ;

! ─── Print Check ──────────────────────────────────────────────────────────
: print-check ( check -- )
    first2                                  ! name passed
    [ "PASS" ] [ "FAIL" ] if               ! name marker
    swap                                    ! marker name
    "  [%s]  %s\n" printf ;

! ─── Separator Line ──────────────────────────────────────────────────────
: separator ( -- )
    40 CHAR: - <string> print ;

! ─── Print Gate Report ────────────────────────────────────────────────────
! ( version mode checks -- )
: print-gate-report ( version mode checks -- )
    dup gate-status :> status
    :> checks :> mode :> version

    "SEIS Release Gate — %s\n" version printf
    separator
    "Status:       %s\n" status status-label printf
    "Motion mode:  %s\n" mode printf
    "Fast (ms):    %d\n" "fast"     mode motion-duration-ms printf
    "Standard (ms):%d\n" "standard" mode motion-duration-ms printf
    separator
    checks [ print-check ] each
    separator
    checks can-deploy?
    "Deploy: AUTHORISED" "Deploy: BLOCKED" ?
    print ;

! ─── Sample Checks ───────────────────────────────────────────────────────
: sample-checks ( -- checks )
    {
        { "typecheck"          t }
        { "lint"               t }
        { "content validation" t }
        { "accessibility"      f }
    } ;

! ─── Main ────────────────────────────────────────────────────────────────
: release-policy-main ( -- )
    "v2.4.0" "full" sample-checks
    print-gate-report ;

! ─── Demonstration ───────────────────────────────────────────────────────
: demo-durations ( -- )
    "standard" "full"    motion-duration-ms "standard/full: %d\n"    printf
    "standard" "reduced" motion-duration-ms "standard/reduced: %d\n" printf
    "cinematic" "full"   motion-duration-ms "cinematic/full: %d\n"   printf ;

demo-durations
release-policy-main
