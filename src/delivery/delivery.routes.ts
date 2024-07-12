import { Router } from "express";
import { DeliveryService } from "./delivery.service";
import { DeliveryController } from "./delivery.controller";
import { PackageService } from "../package/package.service";

export class DeliveryRoutes {
  static get routes(): Router {
    const routes = Router();

    const packageService = new PackageService();
    const deliveryService = new DeliveryService();
    const deliveryController = new DeliveryController(deliveryService, packageService);

    routes.get('/', deliveryController.getAllDeliveries);
    routes.post('/', deliveryController.createDelivery);
    routes.get('/:id', deliveryController.getOneDeliveryById);
    routes.put('/:id', deliveryController.updateDelivery);
    routes.delete('/:id', deliveryController.deleteDelivery);

    return routes;
  }
}