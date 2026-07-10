enum NativeLaneName {
  appleFirst,
  dataAI,
  systems,
  android,
  windows,
  infrastructure,
}

class NativeRoadmapItem {
  const NativeRoadmapItem({
    required this.lane,
    required this.score,
    required this.primaryLanguage,
  });

  final NativeLaneName lane;
  final int score;
  final String primaryLanguage;
}

const nativeRoadmap = <NativeRoadmapItem>[
  NativeRoadmapItem(lane: NativeLaneName.appleFirst, score: 100, primaryLanguage: 'Swift'),
  NativeRoadmapItem(lane: NativeLaneName.dataAI, score: 88, primaryLanguage: 'Python'),
  NativeRoadmapItem(lane: NativeLaneName.systems, score: 84, primaryLanguage: 'Rust'),
  NativeRoadmapItem(lane: NativeLaneName.android, score: 76, primaryLanguage: 'Kotlin'),
  NativeRoadmapItem(lane: NativeLaneName.windows, score: 72, primaryLanguage: 'CSharp'),
  NativeRoadmapItem(lane: NativeLaneName.infrastructure, score: 70, primaryLanguage: 'Go'),
];

NativeRoadmapItem topLane() => nativeRoadmap.first;
