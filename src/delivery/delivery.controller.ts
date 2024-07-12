import { body, matchedData, param, validationResult } from "express-validator";
import { DeliveryService } from "./delivery.service";
import { PackageService } from "../package/package.service";
import { NextFunction, Request, Response } from "express";
import { ApplicationValidationError } from "../errors/application-validation.error";
import { CreateDeliveryDto } from "./create-delivery.dto";
import { DocumentNotFoundError } from "../errors/document-not-found.error";
import { SocketEvent } from "../socket/listener";

export class DeliveryController {
  constructor(
    private readonly deliveryService: DeliveryService,
    private readonly packageService: PackageService
  ) {}

  private deliveryValidationChain = () => [
    body('package_id').notEmpty().isUUID().custom(
      async value => {
        const document = await this.packageService.getOnePackage(value);
        if (!document) {
          throw new Error("Is not a valid package id");
        }
      }
    ),
    body('location').notEmpty().isLatLong().withMessage("Expected format is 'lat,lng'"),
  ];

  private deliveryIdValidationChain = () => [
    param('id').notEmpty().isUUID().custom(
      async value => {
        const document = await this.deliveryService.getOneDeliveryById(value);
        if (!document) {
          throw new Error("Is not a valid delivery id");
        }
      }
    ),
  ];

  createDelivery = [
    ...this.deliveryValidationChain(),
    async (request: Request, response: Response, next: NextFunction) => {
      const result = validationResult(request);
      if (!result.isEmpty()) {
        return next(new ApplicationValidationError(result.array()));
      }
      try {
        const { location: locationString, ...rest } = matchedData(request) as Omit<CreateDeliveryDto, "location"> & { location: string };
        const [lat, lng] = locationString.split(',');
        return response.status(201).send(await this.deliveryService.createDelivery({
          ...rest,
          location: { lat: parseFloat(lat), lng: parseFloat(lng) }
        }));
      } catch (error) {
        return next(error)
      }
    }
  ];

  getAllDeliveries = async (request: Request, response: Response) => {
    return response.status(200).send(await this.deliveryService.getAllDeliveries());
  }

  getOneDeliveryById = [
    param('id').notEmpty().isUUID(),
    async (request: Request, response: Response, next: NextFunction) => {
      const result = validationResult(request);
      if (!result.isEmpty()) {
        return next(new ApplicationValidationError(result.array()));
      }
      try {
        const { id } = matchedData(request) as { id: string };
        const result = await this.deliveryService.getOneDeliveryById(id);
        if (result) return response.status(200).send(result);
        return next(new DocumentNotFoundError('Delivery'));
      } catch (error) {
        return next(error);
      }
    }
  ];

  updateDelivery = [
    ...this.deliveryIdValidationChain(),
    ...this.deliveryValidationChain(),
    async (request: Request, response: Response, next: NextFunction) => {
      const result = validationResult(request);
      if (!result.isEmpty()) {
        return next(new ApplicationValidationError(result.array()));
      }

      try {
        const { id, location: locationString, ...rest } = matchedData(request) as Omit<CreateDeliveryDto, "location"> & { location: string } & { id: string };
        const [lat, lng] = locationString.split(',');

        const delivery = await this.deliveryService.updateDelivery(id, {
          ...rest,
          location: { lat: parseFloat(lat), lng: parseFloat(lng) }
        });

        if (request.io) {
          request.io.emit(SocketEvent.DeliveryUpdated, delivery);
        }

        return response.status(200).send(delivery);
      } catch (error) {
        return next(error)
      }
    }
  ];

  deleteDelivery = [
    ...this.deliveryIdValidationChain(),
    async (request: Request, response: Response, next: NextFunction) => {
      const result = validationResult(request);
      if (!result.isEmpty()) {
        return next(new ApplicationValidationError(result.array()));
      }
      try {
        const { id } = matchedData(request) as { id: string };
        return response.status(200).send(await this.deliveryService.deleteDelivery(id));
      } catch (error) {
        return next(error)
      }
    }
  ];
}