import { ApiError } from '../utils/ApiError.js';

export function validate(schema, target = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.') || target,
        message: issue.message,
      }));
      return next(new ApiError(422, 'Validation failed', errors));
    }
    req[target] = result.data;
    return next();
  };
}

