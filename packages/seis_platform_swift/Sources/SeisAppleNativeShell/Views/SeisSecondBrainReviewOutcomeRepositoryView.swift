import Foundation
import SeisPlatformKit
import SwiftUI

@available(macOS 13.0, iOS 16.0, *)
struct SeisSecondBrainReviewOutcomeRepositoryView: View {
    @State private var repository: SeisSecondBrainReviewOutcomeRepository
    @State private var snapshot = SeisSecondBrainReviewOutcomeSnapshot.empty
    @State private var assignmentId = "native-review-1"
    @State private var agentRole = "apple-platform-agent"
    @State private var pluginLaneId = "apple-native"
    @State private var brief = "Review the shared Apple-native Second Brain surface."
    @State private var outcome: SeisSecondBrainReviewOutcome = .draft
    @State private var message = "Local history has not been hydrated yet."

    init() {
#if canImport(CoreData)
        if let persistentRepository = try? SeisSecondBrainReviewOutcomeRepository.makePersistent() {
            _repository = State(initialValue: persistentRepository)
        } else {
            _repository = State(initialValue: SeisSecondBrainReviewOutcomeRepository())
        }
#else
        _repository = State(initialValue: SeisSecondBrainReviewOutcomeRepository())
#endif
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    header
                    storageCard
                    outcomeForm
                    history
                }
                .padding(20)
                .frame(maxWidth: .infinity, alignment: .leading)
            }
            .navigationTitle("Second Brain")
            .toolbar {
                Button("Hydrate", action: hydrate)
            }
        }
        .onAppear(perform: hydrate)
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label("Review outcomes", systemImage: "brain.head.profile")
                .font(.title2.weight(.semibold))
            Text("Apple-native, local-first review evidence for macOS and iOS.")
                .foregroundStyle(.secondary)
            Text("No provider, MCP, SSH, private vault, GitHub, or autonomous write is used by this surface.")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
    }

    private var storageCard: some View {
        GroupBox("Storage") {
            HStack {
                Label(repository.storageMode.rawValue, systemImage: storageIcon)
                Spacer()
                Text("\(snapshot.records.count) records")
                    .font(.caption.monospaced())
                    .foregroundStyle(.secondary)
            }
            Text(message)
                .font(.caption)
                .foregroundStyle(.secondary)
                .frame(maxWidth: .infinity, alignment: .leading)
        }
    }

    private var outcomeForm: some View {
        GroupBox("Record local outcome") {
            VStack(alignment: .leading, spacing: 12) {
                TextField("Assignment ID", text: $assignmentId)
                    .textFieldStyle(.roundedBorder)
                TextField("Agent role", text: $agentRole)
                    .textFieldStyle(.roundedBorder)
                TextField("Plugin lane", text: $pluginLaneId)
                    .textFieldStyle(.roundedBorder)
                Picker("Outcome", selection: $outcome) {
                    ForEach(SeisSecondBrainReviewOutcome.allCases) { candidate in
                        Text(candidate.label).tag(candidate)
                    }
                }
                TextEditor(text: $brief)
                    .frame(minHeight: 110)
                    .overlay {
                        RoundedRectangle(cornerRadius: 6)
                            .stroke(.quaternary)
                    }
                Text("\(brief.count)/600 characters. Human approval remains required.")
                    .font(.caption2.monospaced())
                    .foregroundStyle(brief.count > 600 ? .red : .secondary)
                Button("Save Local Outcome", action: saveOutcome)
                    .buttonStyle(.borderedProminent)
                    .disabled(brief.count > 600)
            }
        }
    }

    private var history: some View {
        GroupBox("Local history") {
            if snapshot.records.isEmpty {
                Text("No local review outcomes recorded.")
                    .foregroundStyle(.secondary)
            } else {
                VStack(alignment: .leading, spacing: 10) {
                    ForEach(Array(snapshot.records.reversed())) { record in
                        VStack(alignment: .leading, spacing: 4) {
                            HStack {
                                Text(record.outcome.label)
                                    .font(.subheadline.weight(.semibold))
                                Spacer()
                                Text(record.recordedAt)
                                    .font(.caption2.monospaced())
                                    .foregroundStyle(.tertiary)
                            }
                            Text("\(record.agentRole) · \(record.pluginLaneId)")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                            Text(record.brief)
                                .font(.caption)
                                .lineLimit(3)
                        }
                        .padding(.vertical, 4)
                        .accessibilityElement(children: .combine)
                    }
                }
            }
        }
    }

    private var storageIcon: String {
        repository.storageMode == .coreData ? "externaldrive.connected.to.line.below" : "memorychip"
    }

    private func hydrate() {
        do {
            snapshot = try repository.hydrate()
            message = snapshot.records.isEmpty
                ? "Local store is ready for a first review outcome."
                : "Hydrated \(snapshot.records.count) local review outcomes."
        } catch {
            message = "Local store unavailable; no outcome was written."
        }
    }

    private func saveOutcome() {
        let record = SeisSecondBrainReviewOutcomeRecord(
            id: "review-\(UUID().uuidString)",
            assignmentId: assignmentId.trimmingCharacters(in: .whitespacesAndNewlines),
            agentRole: agentRole.trimmingCharacters(in: .whitespacesAndNewlines),
            pluginLaneId: pluginLaneId.trimmingCharacters(in: .whitespacesAndNewlines),
            brief: brief.trimmingCharacters(in: .whitespacesAndNewlines),
            outcome: outcome,
            requiresHumanApproval: true,
            externalActionAllowed: false,
            agentExecutionAllowed: false,
            recordedAt: ISO8601DateFormatter().string(from: Date())
        )

        do {
            try repository.save(record)
            snapshot = try repository.snapshot()
            message = "Saved to the \(repository.storageMode.rawValue) local store."
        } catch {
            message = "Outcome rejected by the local safety contract."
        }
    }
}
