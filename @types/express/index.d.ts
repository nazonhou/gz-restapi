import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

  declare global{
    namespace Express{
      interface Request{
        io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
        /*
          other variables (if needed)
        */
      }
    }
  }