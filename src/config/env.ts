import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import { get } from 'env-var';

dotenvExpand.expand(dotenv.config());

export const envs = {
  PORT: get('PORT').required().asPortNumber(),
  API_PREFIX: get('DEFAULT_API_PREFIX').default('/api/v1').asString(),
  NODE_ENV: get('NODE_ENV').default('development').asString(),
  MONGO_URL: get('MONGO_URL').required().asString(),
  MONGO_DATABASE: get('MONGO_DATABASE').required().asString(),
  CORS_ORIGINS: get('CORS_ORIGINS').required().asArray()
};