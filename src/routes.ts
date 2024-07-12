import { Router } from "express";
import { PackageRoutes } from "./package/package.routes";
import { DeliveryRoutes } from "./delivery/delivery.routes";

export class Routes {
  static get routes(): Router {
    const routes = Router();

    routes.use('/package', PackageRoutes.routes);
    routes.use('/delivery', DeliveryRoutes.routes);

    return routes;
  }
}