import { envs } from './config/env';
import { Database } from './database';

async function bootstrap() {
  try {
    await Database.connect();
  } catch (error) {
    process.exit(1);
  }
  const { Server } = await import('./server')
 
  const server = new Server({ port: envs.PORT, apiPrefix: envs.API_PREFIX, corsOrigins: envs.CORS_ORIGINS });
  await server.start();
}

bootstrap();
