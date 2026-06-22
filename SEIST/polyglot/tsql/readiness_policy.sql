CREATE OR ALTER FUNCTION dbo.seis_ready_for_upload(
  @accessibility_reviewed bit,
  @rollback_planned bit
)
RETURNS bit
AS
BEGIN
  DECLARE @server_target_confirmed bit = 0;
  RETURN IIF(
    @server_target_confirmed = 1 AND @accessibility_reviewed = 1 AND @rollback_planned = 1,
    1,
    0
  );
END;
