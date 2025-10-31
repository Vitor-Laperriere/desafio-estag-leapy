// src/app/api/roles/route.ts
import { NextResponse } from "next/server";
import { env } from "@/core/env";
import { httpGet } from "@/core/http/fetch";

export async function GET() {
  try {
    const url = `${env.DIRECTUS_URL}/items/target_roles?fields=id,name&limit=500&sort[]=name`;
    const res = await httpGet(url, {
      headers: { Authorization: `Bearer ${env.DIRECTUS_TOKEN}` },
      next: { revalidate: 60 },
    });
    const json = await res.json();
    return NextResponse.json({ data: json?.data ?? [] });
  } catch (err: unknown) {
    const message =
      typeof err === "object" && err !== null && "message" in err
        ? String((err as { message?: unknown }).message ?? err)
        : String(err);
    return NextResponse.json(
      { error: "Falha ao consultar cargos", detail: message },
      { status: 500 }
    );
  }
}

