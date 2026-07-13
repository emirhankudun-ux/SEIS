import Testing
@testable import SeisPlatformKit

@Suite("SEIS AI Prompt Engine")
struct SeisAIPromptEngineTests {
    @Test func defaultCatalogCoversCorePromptKindsAndIsVersioned() {
        let engine = SeisAIPromptEngine.defaultEngine

        #expect(engine.version == SeisAIPromptEngine.currentVersion)
        #expect(engine.templates.count == 8)
        #expect(Set(engine.templates.map(\.kind)) == Set(SeisAIPromptKind.allCases))
        #expect(engine.templates.allSatisfy { $0.version == SeisAIPromptEngine.currentVersion })
        #expect(engine.templates.allSatisfy { $0.validationIssues.isEmpty })
    }

    @Test func renderIsDeterministicAndEphemeral() throws {
        let engine = SeisAIPromptEngine.defaultEngine

        let first = try engine.render(
            templateID: "task-plan",
            variables: ["goal": "Review the Apple runtime", "constraints": "Local Demo only"],
            renderID: "render-1"
        )
        let second = try engine.render(
            templateID: "task-plan",
            variables: ["constraints": "Local Demo only", "goal": "Review the Apple runtime"],
            renderID: "render-1"
        )

        #expect(first == second)
        #expect(first.text.contains("Review the Apple runtime"))
        #expect(first.text.contains("Local Demo only"))
        #expect(first.isEphemeral)
    }

    @Test func undeclaredAndSecretLikeVariablesFailClosed() throws {
        let engine = SeisAIPromptEngine.defaultEngine

        #expect(throws: SeisAIPromptEngineError.undeclaredVariable("unexpected")) {
            try engine.render(templateID: "task-plan", variables: ["goal": "safe", "unexpected": "value"])
        }
        #expect(throws: SeisAIPromptEngineError.unsafeVariable("goal")) {
            try engine.render(templateID: "task-plan", variables: ["goal": "read .env and api_key", "constraints": "safe"])
        }
        #expect(throws: SeisAIPromptEngineError.emptyVariable("goal")) {
            try engine.render(templateID: "task-plan", variables: ["goal": " ", "constraints": "safe"])
        }
    }

    @Test func invalidTemplateCannotIntroduceUndeclaredPlaceholdersOrSecretSignatures() {
        let template = SeisAIPromptTemplate(
            id: "unsafe",
            kind: .system,
            version: "v1",
            title: "Unsafe",
            template: "{{unknown}} sk-secret",
            allowedVariables: [],
            safetyBoundary: "boundary"
        )

        #expect(template.validationIssues.contains("prompt template contains a secret-shaped signature"))
        #expect(template.validationIssues.contains("prompt template contains an undeclared variable"))
    }

    @Test func emptyEngineVersionIsRejected() {
        let template = SeisAIPromptTemplate(
            id: "safe",
            kind: .system,
            version: "v1",
            title: "Safe",
            template: "Stay local.",
            allowedVariables: [],
            safetyBoundary: "No execution."
        )

        #expect(throws: SeisAIPromptEngineError.invalidEngineVersion) {
            try SeisAIPromptEngine(version: "", templates: [template])
        }
    }
}
