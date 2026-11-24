const { z } = require('zod');

const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return res.status(400).json({
        message: 'Validation failed',
        errors: errorMessages,
      });
    }
    return res.status(400).json({ message: 'Invalid request data' });
  }
};

module.exports = validate;
