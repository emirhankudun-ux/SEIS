module seis_native_kernel
  implicit none

  type :: native_roadmap_item
     character(len=32) :: lane
     integer :: score
     character(len=32) :: language
  end type native_roadmap_item

  type(native_roadmap_item), parameter :: roadmap(6) = [ &
     native_roadmap_item("Apple First", 100, "Swift"), &
     native_roadmap_item("Data AI", 88, "Python"), &
     native_roadmap_item("Systems", 84, "Rust"), &
     native_roadmap_item("Android", 76, "Kotlin"), &
     native_roadmap_item("Windows", 72, "CSharp"), &
     native_roadmap_item("Infrastructure", 70, "Go") &
  ]

contains
  function top_lane() result(item)
    type(native_roadmap_item) :: item
    item = roadmap(1)
  end function top_lane
end module seis_native_kernel
