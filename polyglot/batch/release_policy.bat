@echo off
:: SEIS Release Policy — Windows Batch / CMD
:: Motion mode resolution and deploy gate validation
:: ════════════════════════════════════════════════

setlocal EnableDelayedExpansion

:: ─── Motion Duration Variables ────────────────────────────────────────────
SET MOTION_INSTANT=0
SET MOTION_FAST=150
SET MOTION_STANDARD=300
SET MOTION_SLOW=500
SET MOTION_CINEMATIC=800

:: ─── Badge Status Values ──────────────────────────────────────────────────
SET STATUS_READY=READY
SET STATUS_PENDING=PENDING
SET STATUS_BLOCKED=BLOCKED
SET STATUS_DRAFT=DRAFT

:: ─── Resolve Motion Mode ─────────────────────────────────────────────────
:: Checks SEIS_MOTION_MODE env var; defaults to full
IF DEFINED SEIS_MOTION_MODE (
    SET MOTION_MODE=%SEIS_MOTION_MODE%
) ELSE (
    SET MOTION_MODE=full
)

:: ─── Apply Reduced-Motion Durations ──────────────────────────────────────
IF /I "%MOTION_MODE%"=="reduced" (
    SET MOTION_FAST=0
    SET MOTION_STANDARD=0
    SET MOTION_SLOW=0
    SET MOTION_CINEMATIC=0
    ECHO [MOTION] Reduced-motion mode active — durations set to 0ms
) ELSE (
    ECHO [MOTION] Full motion mode — standard durations active
)

ECHO Motion standard duration: %MOTION_STANDARD%ms
ECHO Motion fast duration:     %MOTION_FAST%ms

:: ─── Run Release Gate Checks ─────────────────────────────────────────────
SET /A FAIL_COUNT=0
SET VERSION=%1
IF "%VERSION%"=="" SET VERSION=unknown

ECHO.
ECHO SEIS Release Gate ^— %VERSION%
ECHO ─────────────────────────────────────

:: Check: typecheck
CALL npm run typecheck --silent >nul 2>&1
IF %ERRORLEVEL% EQU 0 (
    ECHO   [PASS]  typecheck
) ELSE (
    ECHO   [FAIL]  typecheck
    SET /A FAIL_COUNT+=1
)

:: Check: lint
CALL npm run lint --silent >nul 2>&1
IF %ERRORLEVEL% EQU 0 (
    ECHO   [PASS]  lint
) ELSE (
    ECHO   [FAIL]  lint
    SET /A FAIL_COUNT+=1
)

:: Check: content validation
CALL npm run check:content --silent >nul 2>&1
IF %ERRORLEVEL% EQU 0 (
    ECHO   [PASS]  content validation
) ELSE (
    ECHO   [FAIL]  content validation
    SET /A FAIL_COUNT+=1
)

ECHO ─────────────────────────────────────

:: ─── Gate Decision ────────────────────────────────────────────────────────
IF %FAIL_COUNT% EQU 0 (
    ECHO [READY] All checks passed ^— deploy authorised.
    SET RELEASE_STATUS=%STATUS_READY%
    EXIT /B 0
) ELSE (
    ECHO [BLOCKED] %FAIL_COUNT% check^(s^) failed ^— deploy prohibited.
    SET RELEASE_STATUS=%STATUS_BLOCKED%
    EXIT /B 1
)

endlocal
