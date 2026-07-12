import Foundation
import SeisPlatformKit
import SwiftUI

struct SeisSecondBrainReviewOutcomeView: View {
    @State private var assignmentId = "native-second-brain-review"
    @State private var agentRole = "Architect Agent"
    @State private var pluginLaneId = "seis"
    @State private var brief = ""
    @State private var outcome: SeisSecondBrainReviewOutcome = .draft
    @State private var snapshot = SeisSecondBrainReviewOutcomeSnapshot.empty
    @State private var message = "No native review outcome recorded yet."
    @State private var store = SeisSecondBrainReviewOutcomeHistoryStore()

    private let columns = [
        GridItem(.flexible()),
        GridItem(.flexible())
    ]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                header
                metrics
                editor
                history
            }
            .padding(16)
        }
        .background(.thinMaterial)
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label("SEIS Second Brain", systemImage: "brain.head.profile")
                .font(.title2.weight(.semibold))

            Text("Apple-native, local-first review outcomes for macOS and iOS.")
                .font(.subheadline)
                .foregroundStyle(.secondary)

            Text("No provider, MCP, SSH, private Obsidian vault, GitHub action, or autonomous write is invoked by this surface.")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 16))
    }

    private var metrics: some View {
        LazyVGrid(columns: columns, spacing: 10) {
            nativeMetric("Recorded", value: "\(snapshot.records.count)", symbol: "tray.full.fill")
            nativeMetric("Outcome", value: snapshot.summaryLabel, symbol: "chart.bar.fill")
            nativeMetric("External actions", value: "\(snapshot.externalActionCount)", symbol: "lock.shield.fill")
            nativeMetric("Agent executions", value: "\(snapshot.agentExecutionCount)", symbol: "bolt.slash.fill")
        }
    }

    private func nativeMetric(_ title: String, value: String, symbol: String) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Label(title, systemImage: symbol)
                .font(.caption)
                .foregroundStyle(.secondary)
            Text(value)
                .font(.caption.weight(.semibold))
                .lineLimit(3)
        }
        .padding(12)
        .frame(maxWidth: .infinity, minHeight: 70, alignment: .leading)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
    }

    private var editor: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Record human review outcome")
                .font(.headline)

            TextField("Assignment ID", text: $assignmentId)
                .textFieldStyle(.roundedBorder)
            TextField("Agent role", text: $agentRole)
                .textFieldStyle(.roundedBorder)
            TextField("Plugin lane", text: $pluginLaneId)
                .textFieldStyle(.roundedBorder)

            Picker("Outcome", selection: $outcome) {
                ForEach(SeisSecondBrainReviewOutcome.allCases) { item in
                    Text(item.label).tag(item)
                }
            }
            .pickerStyle(.menu)

            TextEditor(text: $brief)
                .frame(minHeight: 100)
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(Color.secondary.opacity(0.25), lineWidth: 1)
                )
                .accessibilityLabel("Review brief")

            HStack {
                Text("\(brief.count)/600 characters")
                    .font(.caption)
                    .foregroundStyle(brief.count > 600 ? .red : .secondary)
                Spacer()
                Button("Record Local Outcome") {
                    recordOutcome()
                }
                .buttonStyle(.borderedProminent)
                .disabled(brief.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || brief.count > 600)
            }

            Text(message)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding(16)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 16))
    }

    private var history: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Native review history")
                .font(.headline)

            if snapshot.records.isEmpty {
                Text("Record a bounded human review brief to create the first local history item.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            } else {
                ForEach(snapshot.records) { record in
                    VStack(alignment: .leading, spacing: 5) {
                        HStack {
                            Text(record.outcome.label)
                                .font(.subheadline.weight(.semibold))
                            Spacer()
                            Text(record.recordedAt)
                                .font(.caption2.monospaced())
                                .foregroundStyle(.secondary)
                        }
                        Text("\(record.agentRole) · @\(record.pluginLaneId) · \(record.assignmentId)")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                        Text(record.brief)
                            .font(.caption)
                            .lineLimit(3)
                    }
                    .padding(12)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
                }
            }
        }
    }

    private func recordOutcome() {
        let trimmedBrief = brief.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmedBrief.isEmpty, trimmedBrief.count <= 600 else {
            message = "A non-empty review brief up to 600 characters is required."
            return
        }

        let timestamp = ISO8601DateFormatter().string(from: Date())
        let record = SeisSecondBrainReviewOutcomeRecord(
            id: "\(assignmentId)-\(timestamp)",
            assignmentId: assignmentId,
            agentRole: agentRole,
            pluginLaneId: pluginLaneId,
            brief: trimmedBrief,
            outcome: outcome,
            recordedAt: timestamp
        )
        guard record.isTraceable else {
            message = "The native safety contract rejected this review record."
            return
        }

        store.save(record)
        snapshot = store.snapshot()
        message = "Saved locally as \(outcome.label). External action remains disabled."
        brief = ""
    }
}
