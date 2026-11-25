export class ApiError extends Error {
  constructor(statusCode, message, errors = undefined, extra = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.extra = extra;
    this.name = 'ApiError';
  }
}

