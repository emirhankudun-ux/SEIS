module SeisNativeKernel
  ( NativeRoadmapItem(..)
  , roadmap
  , topLane
  ) where

data NativeRoadmapItem = NativeRoadmapItem
  { lane :: String
  , score :: Int
  , language :: String
  } deriving (Eq, Show)

roadmap :: [NativeRoadmapItem]
roadmap =
  [ NativeRoadmapItem "Apple First" 100 "Swift"
  , NativeRoadmapItem "Data AI" 88 "Python"
  , NativeRoadmapItem "Systems" 84 "Rust"
  , NativeRoadmapItem "Android" 76 "Kotlin"
  , NativeRoadmapItem "Windows" 72 "CSharp"
  , NativeRoadmapItem "Infrastructure" 70 "Go"
  ]

topLane :: NativeRoadmapItem
topLane = head roadmap
