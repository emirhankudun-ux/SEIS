import { decisionQuestionGroups, getDecisionQuestionCount } from "@seis/content/decision-questions";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({
    total: getDecisionQuestionCount(),
    groups: decisionQuestionGroups
  });
}
