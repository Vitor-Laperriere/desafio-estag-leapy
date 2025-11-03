// src/app/api/talents/route.ts
import { makeListTalents } from "@application/talent/usecases/list-talents.usecase";
import { makeCreateTalent } from "@application/talent/usecases/create-talent.usecase";
import { DirectusTalentRepository } from "@infrastructure/directus/talent/directus-talent.repository";
import { toResult } from "@shared/result";
import { toNextJsonResponse } from "@presentation/http/response-adapter";

const repo = new DirectusTalentRepository();
const listTalents = makeListTalents(repo);
const createTalent = makeCreateTalent(repo);

export async function GET(req: Request) {
  const result = await toResult(async () => {
    const url = new URL(req.url);
    const params = Object.fromEntries(url.searchParams.entries());
    const { data, total } = await listTalents(params);
    return { data, meta: { filter_count: total } };
  });

  return toNextJsonResponse(result);
}

export async function POST(req: Request) {
  const result = await toResult(async () => {
    const payload = await req.json();
    const data = await createTalent(payload);
    return { data };
  });

  return toNextJsonResponse(result, 201);
}
