import express, { NextFunction, Request, Response } from 'express';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { Server as SocketIoServer } from 'socket.io';
import { createServer } from 'node:http';
import cors from 'cors';

import { Routes } from './routes';
import { errorHandler } from './middlewares';
import { socketListener } from './socket/listener';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

interface ServerOptions {
  port: number;
  apiPrefix: string;
  corsOrigins: string[];
}

export class Server {
  private readonly app = express();
  private readonly server = createServer(this.app);
  private readonly io: SocketIoServer<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
  private readonly port: number;
  private readonly apiPrefix: string;
  private readonly corsOrigins: string[];

  constructor(options: ServerOptions) {
    const { port, apiPrefix, corsOrigins } = options;
    this.port = port;
    this.apiPrefix = apiPrefix;
    this.corsOrigins = corsOrigins;
    this.io = new SocketIoServer(this.server, {
      cors: {
        origin: corsOrigins
      }
    });
  }

  async start(): Promise<void> {
    //* Middlewares
    this.app.use(morgan('combined'));
    this.app.use(cors());
    this.app.use(express.json()); // parse json in request body (allow raw)
    this.app.use(express.urlencoded({ extended: true })); // allow x-www-form-urlencoded
    this.app.use(compression());
    //*  limit repeated requests to public APIs
    // this.app.use(
    //   rateLimit({
    //     max: 100,
    //     windowMs: 60 * 60 * 1000,
    //     message: 'Too many requests from this IP, please try again in one hour'
    //   })
    // );

    //* Add io to all incoming req object
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      req.io = this.io;
      next();
    });

    //* Routes
    this.app.use(this.apiPrefix, Routes.routes);

    //* Any route that does not exists
    this.app.all('*', (req: Request, res: Response) => res.status(404).send({ error: 'Path not found' }));

    //* Error handler middleware
    this.app.use(errorHandler);

    // Connect to socket and listen for events
    this.io.on('connection', socketListener(this.io));

    this.server.listen(this.port, () => {
      console.log(`Server running on port ${this.port}...`);
    });
  }
}