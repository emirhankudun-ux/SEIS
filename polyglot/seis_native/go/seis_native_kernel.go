package seisnative

import "sort"

type NativeRoadmapItem struct {
	Lane     string
	Score    int
	Evidence []string
	NextStep string
}

var Roadmap = []NativeRoadmapItem{
	{Lane: "Apple First", Score: 100, Evidence: []string{"Swift", "SwiftUI", "AppKit"}, NextStep: "Build Apple native surfaces first."},
	{Lane: "Data AI", Score: 88, Evidence: []string{"Python", "evaluation", "memory"}, NextStep: "Keep intelligence workflows measurable."},
	{Lane: "Systems", Score: 84, Evidence: []string{"Rust", "typed contracts"}, NextStep: "Move shared logic into safe modules."},
	{Lane: "Android", Score: 76, Evidence: []string{"Kotlin", "Java"}, NextStep: "Mirror product intent on Android."},
	{Lane: "Windows", Score: 72, Evidence: []string{"CSharp", "DotNet"}, NextStep: "Define Windows product contracts."},
	{Lane: "Infrastructure", Score: 70, Evidence: []string{"Go", "SQL", "Shell"}, NextStep: "Keep operations auditable and reversible."},
}

func OrderedRoadmap() []NativeRoadmapItem {
	items := append([]NativeRoadmapItem(nil), Roadmap...)
	sort.SliceStable(items, func(left, right int) bool {
		return items[left].Score > items[right].Score
	})
	return items
}

func TopLane() NativeRoadmapItem {
	return OrderedRoadmap()[0]
}
