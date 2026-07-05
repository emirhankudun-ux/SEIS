type
  NativeRoadmapItem* = object
    lane*: string
    score*: int
    language*: string

let roadmap* = @[
  NativeRoadmapItem(lane: "Apple First", score: 100, language: "Swift"),
  NativeRoadmapItem(lane: "Data AI", score: 88, language: "Python"),
  NativeRoadmapItem(lane: "Systems", score: 84, language: "Rust"),
  NativeRoadmapItem(lane: "Android", score: 76, language: "Kotlin"),
  NativeRoadmapItem(lane: "Windows", score: 72, language: "CSharp"),
  NativeRoadmapItem(lane: "Infrastructure", score: 70, language: "Go")
]

proc topLane*(): NativeRoadmapItem = roadmap[0]
