const Joi = require('joi');

const fundSchema = Joi.object({
  name: Joi.string().required().min(1).max(255),
  description: Joi.string().allow('', null).max(1000)
});

const quarterSchema = Joi.object({
  fund_id: Joi.number().integer().required(),
  year: Joi.number().integer().min(2000).max(2100).required(),
  quarter: Joi.number().integer().min(1).max(4).required(),
  quarter_date: Joi.string().isoDate().required(),
  pdf_filename: Joi.string().allow(null),
  pdf_path: Joi.string().allow(null)
});

const investmentSchema = Joi.object({
  quarter_id: Joi.number().integer().required(),
  company_name: Joi.string().required().min(1).max(255),
  investment_date: Joi.string().isoDate().allow(null),
  cost: Joi.number().min(0).required(),
  current_value: Joi.number().min(0).required(),
  notes: Joi.string().allow('', null).max(1000)
});

const bulkInvestmentsSchema = Joi.object({
  quarter_id: Joi.number().integer().required(),
  investments: Joi.array().items(Joi.object({
    company_name: Joi.string().required().min(1).max(255),
    investment_date: Joi.string().isoDate().allow(null),
    cost: Joi.number().min(0).required(),
    current_value: Joi.number().min(0).required(),
    notes: Joi.string().allow('', null).max(1000)
  })).min(1).required()
});

function validate(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    next();
  };
}

module.exports = {
  fundSchema,
  quarterSchema,
  investmentSchema,
  bulkInvestmentsSchema,
  validate
};
