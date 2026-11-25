import { ApiError } from '../utils/ApiError.js';

export function role(...allowed) {
  return (req, _res, next) => {
    if (!req.user || !allowed.includes(req.user.role)) {
      return next(new ApiError(403, 'Forbidden: insufficient permissions'));
    }
    return next();
  };
}

