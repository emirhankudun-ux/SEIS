import rawDecisionQuestions from "./decision-questions.json";

export type DecisionQuestionGroup = {
  id: string;
  title: string;
  questions: string[];
};

export const decisionQuestionGroups = rawDecisionQuestions as DecisionQuestionGroup[];

export function getDecisionQuestionCount(): number {
  return decisionQuestionGroups.reduce((total, group) => total + group.questions.length, 0);
}

export function getDecisionQuestionPreview(limit = 12): Array<{ groupId: string; groupTitle: string; question: string }> {
  return decisionQuestionGroups
    .flatMap((group) => group.questions.map((question) => ({
      groupId: group.id,
      groupTitle: group.title,
      question
    })))
    .slice(0, limit);
}
