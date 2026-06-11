; SEIS Readiness Contract — x86-64 Assembly (NASM syntax)
; Checks that the motion mode value is within the valid range [0, 2]

section .data
    MODE_CINEMATIC equ 0
    MODE_BALANCED  equ 1
    MODE_REDUCED   equ 2
    PREFERS_REDUCED equ 1          ; simulate prefers-reduced-motion: reduce

section .text
    global seis_resolve_motion
    global seis_can_deploy

; rdi = requested_mode (0=cinematic, 1=balanced, 2=reduced)
; rsi = prefers_reduced (0 or 1)
; returns rax = resolved mode
seis_resolve_motion:
    test rsi, rsi
    jnz .force_reduced
    mov rax, rdi
    ret
.force_reduced:
    mov rax, MODE_REDUCED
    ret

; rdi = release_status (0=ready, 1=blocked, 2=pending)
; returns rax = 1 if can deploy, 0 otherwise
seis_can_deploy:
    xor rax, rax
    test rdi, rdi
    setz al
    ret
