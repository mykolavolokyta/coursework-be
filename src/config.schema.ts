import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  // PORT: Joi.number().port().default(3001),
  // DB_TYPE: Joi.string().required(),
  // DB_HOST: Joi.string().required(),
  // DB_PORT: Joi.number().port().default(5432),
  // DB_USERNAME: Joi.string().required(),
  // DB_PASSWORD: Joi.string().required(),
  // DB_NAME: Joi.string().required(),
  AUTH0_CLIENT_ID: Joi.string().required(),
  AUTH0_CLIENT_SECRET: Joi.string().required(),
  AUTH0_DOMAIN: Joi.string().required(),
});
