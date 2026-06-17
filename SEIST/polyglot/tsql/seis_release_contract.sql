CREATE OR ALTER FUNCTION dbo.seis_ready_for_upload(
  @target_confirmed bit,
  @accessibility_reviewed bit,
  @rollback_planned bit
)
RETURNS bit
AS
BEGIN
  RETURN IIF(
    @target_confirmed = 1 AND @accessibility_reviewed = 1 AND @rollback_planned = 1,
    1,
    0
  );
END;
