// Central error handler. Routes can `next(err)` to land here, or throw inside
// an async handler wrapped by `asyncHandler` (see below).

function notFound(req, res, next) {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  // Zod validation errors include a `.errors` array
  if (err.name === 'ZodError') {
    return res.status(400).json({
      message: 'Validation failed',
      errors: err.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
    });
  }

  const status = err.status || 500;
  if (process.env.NODE_ENV === 'development') {
    console.error(err);
  }
  res.status(status).json({
    message: err.message || 'Internal server error',
  });
}

// Wrap async route handlers so thrown errors are forwarded to errorHandler.
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { notFound, errorHandler, asyncHandler };
