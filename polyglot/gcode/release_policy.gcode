; SEIS Release Policy — G-Code (CNC / 3D Printer)
; Represents release gate phases as machining operations

; === SEIS Deploy Readiness Check ===
G28         ; Home all axes (reset to known state)
G21         ; Set units to millimeters
G90         ; Absolute positioning mode

; Phase 1 — Quality check (slow, deliberate pass)
T01 M06     ; Select quality-check tool
G00 Z5.0    ; Safe clearance height
G00 X0.0 Y0.0  ; Move to origin — start of check
G01 X100.0 F500  ; Traverse quality gate at reduced feed rate
G04 P1000   ; Dwell 1s — simulate check duration

; Phase 2 — Motion mode resolution
; M-codes > M100 are user-defined; here we simulate mode selection
M101        ; Set motion mode: cinematic (600ms)
G04 P600
M102        ; Override: reduced motion (0ms if prefers-reduced-motion)
G04 P0

; Phase 3 — Release gate: GO / NO-GO
; If previous passes OK, proceed to final position (deploy)
G00 X200.0 Y200.0 F3000  ; Fast move to deploy position
M30                       ; End of program — deploy authorized

; === ABORT (blocked gate) ===
; M00   ; Program stop — operator intervention required
; G28   ; Return to home
