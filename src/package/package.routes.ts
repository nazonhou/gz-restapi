import { Router } from "express";
import { PackageService } from "./package.service";
import { PackageController } from "./package.controller";
import { DeliveryService } from "../delivery/delivery.service";

export class PackageRoutes {
  static get routes(): Router {
    const routes = Router();

    const packageService = new PackageService();
    const deliveryService = new DeliveryService();
    const packageController = new PackageController(packageService, deliveryService);

    routes.get('/', packageController.getAllPackages);
    routes.post('/', packageController.createPackage);
    routes.get('/:id', packageController.getOnePackage);
    routes.put('/:id', packageController.updatePackage);
    routes.delete('/:id', packageController.deletePackage);

    return routes;
  }
}