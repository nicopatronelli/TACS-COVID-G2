const errors = require('../errors/internal_codes');
const logger = require('../logger');

const DEFAULT_STATUS_CODE = 500;

const statusCodes = {
  [errors.DATABASE_ERROR]: 503,
  [errors.NOT_FOUND]: 404,
  [errors.INVALID_PARAMS]: 400,
  [errors.EMPTY_BODY]: 400,
  [errors.INVALID_TOKEN]: 400,
  [errors.EXTERNAL_SERVICE_ERROR]: 503,
  [errors.INVALID_COUNTRIES]: 400,
  [errors.INVALID_CREDENTIALS]: 401,
  [errors.INTERNAL_SERVER_ERROR]: 500,
  [errors.UNAUTHORIZED]: 401
};

// eslint-disable-next-line
exports.handle = (error, req, res, next) => {
  /* istanbul ignore next */
  logger.error(error);
  res.status((error.internalCode && statusCodes[error.internalCode]) || DEFAULT_STATUS_CODE);
  return res.send({ message: error.message, internal_code: error.internalCode });
};
