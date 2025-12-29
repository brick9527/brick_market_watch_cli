const Joi = require('joi');

function getKlineDataOptionsValidator(options) {
  // Define Joi validation schema for getklinedata command options
  const schema = Joi.object({
    symbolList: Joi.string()
      .trim()
      .required()
      .description('Comma-separated list of trading pairs (e.g., BTCUSDT,ETHUSDT)'),
    
    interval: Joi.string()
      .trim()
      .required()
      .valid('1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M')
      .description('Kline interval'),
    
    startTime: Joi.alternatives()
      .try(
        Joi.string().trim(),
        Joi.number().integer()
      )
      .required()
      .description('Start time (ISO string or timestamp)'),
    
    endTime: Joi.alternatives()
      .try(
        Joi.string().trim(),
        Joi.number().integer()
      )
      .required()
      .description('End time (ISO string or timestamp)'),
    
    outputFolder: Joi.string()
      .trim()
      .required()
      .description('Output folder path for saving kline data')
  });

  // Validate options against schema
  const { error, value } = schema.validate(options, {
    abortEarly: false, // Report all errors, not just the first one
    allowUnknown: false // Disallow unknown properties
  });

  return {
    isValid: !error,
    errors: error ? error.details.map(detail => detail.message) : [],
    validatedOptions: value
  };
}

module.exports = getKlineDataOptionsValidator;