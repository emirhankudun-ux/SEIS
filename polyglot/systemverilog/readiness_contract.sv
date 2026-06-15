// SEIS Readiness Contract — SystemVerilog

package seis_types;
  typedef enum logic [1:0] {
    CINEMATIC = 2'b00,
    BALANCED  = 2'b01,
    REDUCED   = 2'b10
  } motion_mode_t;

  typedef enum logic [1:0] {
    READY   = 2'b00,
    BLOCKED = 2'b01,
    PENDING = 2'b10
  } release_status_t;
endpackage

module SeisReadinessContract
  import seis_types::*;
(
  input  logic           prefers_reduced_motion,
  input  motion_mode_t   requested_mode,
  input  release_status_t release_status,
  output motion_mode_t   resolved_mode,
  output logic           can_deploy
);
  assign resolved_mode = prefers_reduced_motion ? REDUCED : requested_mode;
  assign can_deploy    = (release_status == READY);
endmodule
