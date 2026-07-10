package Seis_Native_Kernel is
   type Native_Roadmap_Item is record
      Lane : String (1 .. 32);
      Score : Integer;
   end record;

   Apple_First    : constant String := "Apple First";
   Data_AI        : constant String := "Data AI";
   Systems        : constant String := "Systems";
   Android        : constant String := "Android";
   Windows        : constant String := "Windows";
   Infrastructure : constant String := "Infrastructure";

   function Top_Lane return String;
end Seis_Native_Kernel;
