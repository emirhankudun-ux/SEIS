/* SEIS Release Policy — SAS (Statistical Analysis System) */

%let MOTION_CINEMATIC = cinematic;
%let MOTION_BALANCED  = balanced;
%let MOTION_REDUCED   = reduced;

/* Motion duration lookup dataset */
data motion_durations;
    length mode $20;
    input mode $ duration_ms;
    datalines;
cinematic 600
balanced  300
reduced     0
;
run;

/* Release gate dataset */
data release_gate;
    length status $20;
    input status $;
    can_deploy = (status = 'ready');
    datalines;
ready
blocked
pending
;
run;

/* Resolve motion mode macro */
%macro resolve_motion(requested=, prefers_reduced=0);
    %if &prefers_reduced = 1 %then %do;
        %put Resolved mode: &MOTION_REDUCED;
    %end;
    %else %do;
        %put Resolved mode: &requested;
    %end;
%mend;

%resolve_motion(requested=&MOTION_CINEMATIC, prefers_reduced=1);

proc print data=motion_durations; run;
proc print data=release_gate;     run;
