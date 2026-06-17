import { getConnectors } from "@seis/runtime";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({
    connectors: getConnectors()
  });
}
