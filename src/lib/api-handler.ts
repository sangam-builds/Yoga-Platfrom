import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "./errors";
import { logger } from "./logger";

export type ApiHandlerFn = (request: Request) => Promise<NextResponse | Response>;

/**
 * Standard API route wrapper:
 * - Catches AppErrors and maps them to HTTP status codes
 * - Catches ZodErrors and formats clean validation messages
 * - Structured logging with generated request IDs
 * - Safe generic error messages in production
 */
export function createApiHandler(handler: ApiHandlerFn): ApiHandlerFn {
  return async (request: Request) => {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();
    const url = new URL(request.url);

    try {
      logger.info({ requestId, method: request.method, path: url.pathname }, "Incoming API request");
      const response = await handler(request);
      const durationMs = Date.now() - startTime;
      logger.info({ requestId, status: response.status, durationMs }, "Completed API request");
      return response;
    } catch (error: unknown) {
      const durationMs = Date.now() - startTime;

      if (error instanceof AppError) {
        logger.warn(
          { requestId, errCode: error.code, status: error.statusCode, message: error.message, durationMs },
          "Handled operational error"
        );
        return NextResponse.json(
          {
            error: error.message,
            code: error.code,
            requestId,
          },
          { status: error.statusCode }
        );
      }

      if (error instanceof ZodError) {
        const issues = error.issues.map((i) => ({ path: i.path.join("."), message: i.message }));
        logger.warn({ requestId, issues, durationMs }, "Validation error");
        return NextResponse.json(
          {
            error: "Validation failed",
            code: "VALIDATION_ERROR",
            details: issues,
            requestId,
          },
          { status: 422 }
        );
      }

      // Unhandled / system errors: never leak stack trace or internal details to the user
      logger.error({ requestId, err: error, durationMs }, "Unhandled API server exception");
      return NextResponse.json(
        {
          error: "An unexpected error occurred. Please try again later.",
          code: "INTERNAL_SERVER_ERROR",
          requestId,
        },
        { status: 500 }
      );
    }
  };
}

