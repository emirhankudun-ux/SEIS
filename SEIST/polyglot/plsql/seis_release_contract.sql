CREATE OR REPLACE FUNCTION seis_ready_for_upload(
  target_confirmed NUMBER,
  accessibility_reviewed NUMBER,
  rollback_planned NUMBER
) RETURN NUMBER IS
BEGIN
  IF target_confirmed = 1 AND accessibility_reviewed = 1 AND rollback_planned = 1 THEN
    RETURN 1;
  END IF;

  RETURN 0;
END;
/
