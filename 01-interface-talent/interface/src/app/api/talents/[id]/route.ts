import { NextResponse } from "next/server";
import { makeGetTalent } from "@/modules/talent/application/usecases/get-talent";
import { makeUpdateTalent } from "@/modules/talent/application/usecases/update-talent";
import { makeDeleteTalent } from "@/modules/talent/application/usecases/delete-talent";
import { DirectusTalentRepository } from "@/modules/talent/infra/directus/repo";

const repo = new DirectusTalentRepository();
const getTalent = makeGetTalent(repo);
const updateTalent = makeUpdateTalent(repo);
const deleteTalent = makeDeleteTalent(repo);

function formatError(err: unknown) {
  return typeof err === "object" && err !== null && "message" in err
    ? String((err as { message?: unknown }).message ?? err)
    : String(err);
}

type RouteParams = { id: string };
type RouteContext = {
  params: RouteParams | Promise<RouteParams>;
};

async function resolveId(context: RouteContext) {
  const params = await Promise.resolve(context.params);
  return params?.id ?? "";
}

export async function GET(_req: Request, context: RouteContext) {
  try {
    const id = await resolveId(context);
    const talent = await getTalent(id);
    if (!talent) {
      return NextResponse.json(
        { error: "Talento não encontrado" },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: talent });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: "Falha ao carregar talento", detail: formatError(err) },
      { status: 400 }
    );
  }
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const id = await resolveId(context);
    const payload = await req.json();
    const data = await updateTalent(id, payload);
    return NextResponse.json({ data });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: "Falha ao atualizar talento", detail: formatError(err) },
      { status: 400 }
    );
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const id = await resolveId(context);
    await deleteTalent(id);
    return new NextResponse(null, { status: 204 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: "Falha ao remover talento", detail: formatError(err) },
      { status: 400 }
    );
  }
}
