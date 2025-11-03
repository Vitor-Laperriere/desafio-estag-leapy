// src/app/api/distinct/route.ts
import { NextResponse } from "next/server";
import { env } from "@shared/config/env";
import { httpGet } from "@shared/http/http-client";
import { toResult } from "@shared/result";
import { toNextJsonResponse } from "@presentation/http/response-adapter";

type DirectusDistinctResponse = {
  data?: Array<Record<string, unknown>>;
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const collection = url.searchParams.get("collection");
  const field = url.searchParams.get("field");
  if (!collection || !field) {
    return NextResponse.json(
      { error: "Parâmetros 'collection' e 'field' são obrigatórios" },
      { status: 400 }
    );
  }

  const result = await toResult(async () => {
    const directusUrl = `${env.DIRECTUS_URL}/items/${encodeURIComponent(
      collection
    )}?aggregate[count]=*&groupBy[]=${encodeURIComponent(
      field
    )}&fields=${encodeURIComponent(field)}&limit=500`;

    const res = await httpGet(directusUrl, {
      headers: { Authorization: `Bearer ${env.DIRECTUS_TOKEN}` },
      next: { revalidate: 30 },
    });
    const json = (await res.json()) as DirectusDistinctResponse;
    const data = Array.isArray(json.data) ? json.data : [];
    const sanitized = data
      .map((record) => record?.[field])
      .filter((value): value is string => typeof value === "string")
      .map((value) => value.trim())
      .filter((value) => value.length > 0);
    const values = Array.from(new Set(sanitized));
    return { data: values };
  });

  return toNextJsonResponse(result);
}
