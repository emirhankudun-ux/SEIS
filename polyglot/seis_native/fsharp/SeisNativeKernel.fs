namespace Seis.NativeKernel

type NativeRoadmapItem =
    { Lane: string
      Score: int
      Language: string }

module SeisNativeKernel =
    let roadmap =
        [ { Lane = "Apple First"; Score = 100; Language = "Swift" }
          { Lane = "Data AI"; Score = 88; Language = "Python" }
          { Lane = "Systems"; Score = 84; Language = "Rust" }
          { Lane = "Android"; Score = 76; Language = "Kotlin" }
          { Lane = "Windows"; Score = 72; Language = "CSharp" }
          { Lane = "Infrastructure"; Score = 70; Language = "Go" } ]

    let topLane = List.head roadmap
