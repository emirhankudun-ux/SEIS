import { getSkills } from "@seis/runtime";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({
    skills: getSkills()
  });
}
