import SwiftUI

struct SeisFlowStepper: View {
    let steps: [String]
    let currentStep: Int

    init(steps: [String], currentStep: Int = 1) {
        self.steps = steps
        self.currentStep = currentStep
    }

    var body: some View {
        let normalizedCurrentStep = max(1, min(currentStep, max(1, steps.count)))

        VStack(alignment: .leading, spacing: 6) {
            Text("Kullanım Aşaması")
                .font(.caption)
                .foregroundStyle(.secondary)

            HStack(spacing: 7) {
                ForEach(Array(steps.enumerated()), id: \.offset) { index, step in
                    let completed = index < normalizedCurrentStep - 1
                    let current = index == normalizedCurrentStep - 1

                    HStack(spacing: 6) {
                        stepMarker(
                            index: index,
                            completed: completed,
                            current: current
                        )

                        Text(step)
                            .font(.caption2)
                            .lineLimit(1)
                            .foregroundStyle(current ? Color.primary : .secondary)
                            .fontWeight(current ? .semibold : .regular)

                        if index < steps.count - 1 {
                            Capsule()
                                .fill(completed ? Color.green.opacity(0.5) : Color.secondary.opacity(0.25))
                                .frame(height: 2)
                        }
                    }
                }
            }
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel(Text(accessibilitySummary(currentStep: normalizedCurrentStep)))
    }

    private func stepMarker(index: Int, completed: Bool, current: Bool) -> some View {
        ZStack {
            Circle()
                .fill(markerFill(completed: completed, current: current))
                .frame(width: 18, height: 18)

            if completed {
                Image(systemName: "checkmark")
                    .font(.caption2)
                    .fontWeight(.bold)
                    .foregroundStyle(.white)
            } else {
                Text("\(index + 1)")
                    .font(.caption2)
                    .fontWeight(.semibold)
                    .foregroundStyle(current ? .white : .secondary)
            }
        }
    }

    private func markerFill(completed: Bool, current: Bool) -> Color {
        if completed {
            return Color.green.opacity(0.45)
        }

        if current {
            return Color.accentColor.opacity(0.45)
        }

        return Color.secondary.opacity(0.2)
    }

    private func accessibilitySummary(currentStep: Int) -> String {
        let currentTitle = steps.indices.contains(currentStep - 1) ? steps[currentStep - 1] : ""
        return "Kullanım Aşaması, \(currentStep) / \(max(steps.count, 1)), \(currentTitle)"
    }
}
