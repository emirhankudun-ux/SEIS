package Seis_Release_Contract is
   Package_Path : constant String := "dist/seis-static.zip";
   Reduced_Motion_Required : constant Boolean := True;
   Live_Upload_Requires_Target : constant Boolean := True;

   type Locale_Index is range 1 .. 7;
   type Locale_List is array (Locale_Index) of String (1 .. 2);
   Supported_Locales : constant Locale_List :=
     ("tr", "en", "fr", "it", "de", "es", "ar");
end Seis_Release_Contract;
