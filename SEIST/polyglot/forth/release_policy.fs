false constant server-target-confirmed
true constant reduced-motion-supported
3 constant minimum-evidence-items

: ready-for-upload ( accessibility-reviewed rollback-planned -- ready )
  server-target-confirmed and and
;
