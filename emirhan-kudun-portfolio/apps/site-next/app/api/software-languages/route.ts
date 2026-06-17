import { polyglotSourceContracts, softwareLanguages } from "@seis/content";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({
    total: softwareLanguages.length,
    polyglotContractTotal: polyglotSourceContracts.length,
    languages: softwareLanguages,
    polyglotContracts: polyglotSourceContracts
  });
}
