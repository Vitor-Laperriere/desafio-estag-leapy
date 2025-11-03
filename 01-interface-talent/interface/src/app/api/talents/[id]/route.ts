import { NextResponse } from "next/server";
import { makeGetTalent } from "@application/talent/usecases/get-talent.usecase";
import { makeUpdateTalent } from "@application/talent/usecases/update-talent.usecase";
import { makeDeleteTalent } from "@application/talent/usecases/delete-talent.usecase";
import { DirectusTalentRepository } from "@infrastructure/directus/talent/directus-talent.repository";
import { toResult } from "@shared/result";
import { toNextJsonResponse } from "@presentation/http/response-adapter";

const repo = new DirectusTalentRepository();
const getTalent = makeGetTalent(repo);
const updateTalent = makeUpdateTalent(repo);
const deleteTalent = makeDeleteTalent(repo);

type RouteParams = { id: string };
type RouteContext = {
  params: RouteParams | Promise<RouteParams>;
};

async function resolveId(context: RouteContext) {
  const params = await Promise.resolve(context.params);
  return params?.id ?? "";
}

export async function GET(_req: Request, context: RouteContext) {
  const id = await resolveId(context);
  const result = await toResult(() => getTalent(id));

  if (result.ok) {
    const talent = result.value;
    if (!talent) {
      return NextResponse.json(
        { error: "Talento não encontrado" },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: talent });
  }
  return toNextJsonResponse(result);
}

export async function PATCH(req: Request, context: RouteContext) {
  const id = await resolveId(context);
  const result = await toResult(async () => {
    const payload = await req.json();
    const data = await updateTalent(id, payload);
    return { data };
  });

  return toNextJsonResponse(result);
}

export async function DELETE(_req: Request, context: RouteContext) {
  const id = await resolveId(context);
  const result = await toResult(async () => {
    await deleteTalent(id);
    return null;
  });

  if (result.ok) {
    return new NextResponse(null, { status: 204 });
  }
  return toNextJsonResponse(result);
}
