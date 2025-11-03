import { NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  ApplicationError,
  DomainError,
  InfrastructureError,
  ValidationError,
  BaseError,
  ensureError,
} from "@shared/errors";

export type ErrorHttpResponse = {
  status: number;
  body: { error: string; detail: string };
};

export function mapErrorToResponse(raw: unknown): ErrorHttpResponse {
  const error = ensureError(raw);

  let status = 500;
  if (error instanceof ValidationError || error instanceof ZodError) {
    status = 400;
  } else if (error instanceof DomainError) {
    status = 400;
  } else if (error instanceof ApplicationError) {
    status = 422;
  } else if (error instanceof InfrastructureError) {
    status = 502;
  }

  const detail = error.message ?? "Erro inesperado";
  const errorName = error instanceof BaseError ? error.name : "InternalServerError";

  return {
    status,
    body: {
      error: errorName,
      detail,
    },
  };
}

export function toErrorResponse(raw: unknown) {
  const { status, body } = mapErrorToResponse(raw);
  return NextResponse.json(body, { status });
}
