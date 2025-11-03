import { NextResponse } from "next/server";
import { isErr, type Result } from "@shared/result";
import { mapErrorToResponse } from "./error-response";

export function toNextJsonResponse<T>(
  result: Result<T>,
  successStatus = 200
) {
  if (isErr(result)) {
    const { status, body } = mapErrorToResponse(result.error);
    return NextResponse.json(body, { status });
  }

  return NextResponse.json(result.value, { status: successStatus });
}
