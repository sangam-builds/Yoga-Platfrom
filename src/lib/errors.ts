export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, code = "INTERNAL_ERROR", isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request", code = "BAD_REQUEST") {
    super(message, 400, code);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required", code = "UNAUTHORIZED") {
    super(message, 401, code);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Access forbidden", code = "FORBIDDEN") {
    super(message, 403, code);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found", code = "NOT_FOUND") {
    super(message, 404, code);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict detected", code = "CONFLICT") {
    super(message, 409, code);
  }
}

export class ValidationError extends AppError {
  public readonly errors?: unknown;

  constructor(message = "Validation failed", errors?: unknown) {
    super(message, 422, "VALIDATION_ERROR");
    this.errors = errors;
  }
}

export class PaymentError extends AppError {
  constructor(message = "Payment processing error", statusCode = 400, code = "PAYMENT_ERROR") {
    super(message, statusCode, code);
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests. Please try again later.", code = "RATE_LIMITED") {
    super(message, 429, code);
  }
}

