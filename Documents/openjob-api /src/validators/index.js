const Joi = require('joi');
const ValidationError = require('../exceptions/ValidationError');

const userSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('user', 'admin').default('user'),
});

const companySchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  location: Joi.string().min(1).max(100).required(),
  description: Joi.string().optional().allow('', null),
});

const categorySchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
});

const jobSchema = Joi.object({
  company_id: Joi.string().required(),
  category_id: Joi.string().required(),
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().optional().allow('', null),
  job_type: Joi.string().optional().allow('', null),
  experience_level: Joi.string().optional().allow('', null),
  location_type: Joi.string().optional().allow('', null),
  location_city: Joi.string().optional().allow('', null),
  salary_min: Joi.number().optional().allow(null),
  salary_max: Joi.number().optional().allow(null),
  is_salary_visible: Joi.boolean().optional(),
  status: Joi.string().valid('open', 'close').default('open'),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const deleteAuthSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const applicationSchema = Joi.object({
  user_id: Joi.string().required(),
  job_id: Joi.string().required(),
  status: Joi.string().valid('pending', 'accepted', 'rejected').default('pending'),
});

const applicationStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'accepted', 'rejected').required(),
});

function validate(schema, data) {
  const { error, value } = schema.validate(data, { abortEarly: false });
  if (error) {
    const message = error.details.map((d) => d.message).join('; ');
    throw new ValidationError(message);
  }
  return value;
}

module.exports = {
  validateUser: (data) => validate(userSchema, data),
  validateCompany: (data) => validate(companySchema, data),
  validateCategory: (data) => validate(categorySchema, data),
  validateJob: (data) => validate(jobSchema, data),
  validateLogin: (data) => validate(loginSchema, data),
  validateRefreshToken: (data) => validate(refreshTokenSchema, data),
  validateDeleteAuth: (data) => validate(deleteAuthSchema, data),
  validateApplication: (data) => validate(applicationSchema, data),
  validateApplicationStatus: (data) => validate(applicationStatusSchema, data),
};
