package seis_kernel_go

import "sort"

type DomainSignal struct {
	ID               string
	Lane             string
	PluginCount      int
	QualityGateCount int
	HasAgentRole     bool
	HasFlow          bool
}

type BudgetResult struct {
	DomainCount      int
	MinimumPlugins   int
	MinimumGates     int
	ReadyDomainCount int
	BlockedDomainIDs []string
	CoveragePercent  float64
}

func EvaluateCapabilityBudget(domains []DomainSignal, minPlugins int, minGates int) BudgetResult {
	result := BudgetResult{
		DomainCount:    len(domains),
		MinimumPlugins: minPlugins,
		MinimumGates:   minGates,
	}

	for _, domain := range domains {
		ready := domain.ID != "" &&
			domain.Lane != "" &&
			domain.PluginCount >= minPlugins &&
			domain.QualityGateCount >= minGates &&
			domain.HasAgentRole &&
			domain.HasFlow
		if ready {
			result.ReadyDomainCount++
		} else {
			result.BlockedDomainIDs = append(result.BlockedDomainIDs, domain.ID)
		}
	}

	sort.Strings(result.BlockedDomainIDs)
	if result.DomainCount > 0 {
		result.CoveragePercent = float64(result.ReadyDomainCount) / float64(result.DomainCount) * 100
	}
	return result
}

func LaneHistogram(domains []DomainSignal) map[string]int {
	histogram := map[string]int{}
	for _, domain := range domains {
		if domain.Lane == "" {
			histogram["unmapped"]++
			continue
		}
		histogram[domain.Lane]++
	}
	return histogram
}
