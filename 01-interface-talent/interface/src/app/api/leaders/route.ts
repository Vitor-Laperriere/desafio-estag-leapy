// src/app/api/leaders/route.ts
import { env } from "@shared/config/env";
import { httpGet } from "@shared/http/http-client";
import { toResult } from "@shared/result";
import { toNextJsonResponse } from "@presentation/http/response-adapter";

export async function GET() {
  const result = await toResult(async () => {
    const url = `${env.DIRECTUS_URL}/items/internship_leaders?fields=id,position,department&limit=500&sort[]=position`;
    const res = await httpGet(url, {
      headers: { Authorization: `Bearer ${env.DIRECTUS_TOKEN}` },
      next: { revalidate: 60 },
    });
    const json = await res.json();
    return { data: json?.data ?? [] };
  });

  return toNextJsonResponse(result);
}
