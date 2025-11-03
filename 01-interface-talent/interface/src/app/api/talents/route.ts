// src/app/api/talents/route.ts
import { NextResponse } from "next/server";
import { makeListTalents } from "@/modules/talent/application/usecases/list-talents";
import { makeCreateTalent } from "@/modules/talent/application/usecases/create-talent";
import { DirectusTalentRepository } from "@/modules/talent/infra/directus/repo";

const repo = new DirectusTalentRepository();
const listTalents = makeListTalents(repo);
const createTalent = makeCreateTalent(repo);

function formatError(err: unknown) {
  return typeof err === "object" && err !== null && "message" in err
    ? String((err as { message?: unknown }).message ?? err)
    : String(err);
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const params = Object.fromEntries(url.searchParams.entries());
    const { data, total } = await listTalents(params);
    return NextResponse.json({ data, meta: { filter_count: total } });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: "Falha ao consultar talentos", detail: formatError(err) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const data = await createTalent(payload);
    return NextResponse.json({ data }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: "Falha ao criar talento", detail: formatError(err) },
      { status: 400 }
    );
  }
}
