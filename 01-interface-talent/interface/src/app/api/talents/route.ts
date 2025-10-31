// src/app/api/talents/route.ts
import { NextResponse } from "next/server";
import { makeListTalents } from "@/modules/talent/application/usecases/list-talents";
import { DirectusTalentRepository } from "@/modules/talent/infra/directus/repo";

const listTalents = makeListTalents(new DirectusTalentRepository());

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const params = Object.fromEntries(url.searchParams.entries());
    const { data, total } = await listTalents(params);
    return NextResponse.json({ data, meta: { filter_count: total } });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Falha ao consultar talentos", detail: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}
