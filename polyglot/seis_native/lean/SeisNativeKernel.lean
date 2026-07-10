structure NativeRoadmapItem where
  lane : String
  score : Nat
  language : String
deriving Repr, BEq

def roadmap : List NativeRoadmapItem := [
  { lane := "Apple First", score := 100, language := "Swift" },
  { lane := "Data AI", score := 88, language := "Python" },
  { lane := "Systems", score := 84, language := "Rust" },
  { lane := "Android", score := 76, language := "Kotlin" },
  { lane := "Windows", score := 72, language := "CSharp" },
  { lane := "Infrastructure", score := 70, language := "Go" }
]

def topLane : Option NativeRoadmapItem :=
  roadmap.head?
