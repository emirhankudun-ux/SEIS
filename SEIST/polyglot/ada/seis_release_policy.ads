package Seis_Release_Policy is
   Server_Target_Confirmed : constant Boolean := False;
   Reduced_Motion_Supported : constant Boolean := True;
   Minimum_Evidence_Items : constant Natural := 3;

   function Ready_For_Upload
     (Accessibility_Reviewed : Boolean;
      Rollback_Planned       : Boolean) return Boolean;
end Seis_Release_Policy;
