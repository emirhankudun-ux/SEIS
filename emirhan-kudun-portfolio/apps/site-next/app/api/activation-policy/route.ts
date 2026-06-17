import { activationPolicies } from "@seis/runtime/activation-policy";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({
    policies: activationPolicies
  });
}
