import { NextFunction, Request, Response } from "express";
import { PackageService } from "./package.service";
import { body, matchedData, param, validationResult } from "express-validator";
import { CreatePackageDto } from "./create-package.dto";
import { ApplicationValidationError } from "../errors/application-validation.error";
import { DocumentNotFoundError } from "../errors/document-not-found.error";
import { UpdatePackageDto } from "./update-package.dto";
import { DeliveryService } from "../delivery/delivery.service";

export class PackageController {
  constructor(
    private readonly packageService: PackageService,
    private readonly deliveryService: DeliveryService
  ) {}

  private packageValidationChain = () => [
    body('description').notEmpty(),
    body('weight').notEmpty().isFloat({ gt: 0 }),
    body('width').notEmpty().isFloat({ gt: 0 }),
    body('height').notEmpty().isFloat({ gt: 0 }),
    body('depth').notEmpty().isFloat({ gt: 0 }),
    body('from_name').notEmpty().isString(),
    body('from_address').notEmpty().isString(),
    body('from_location').notEmpty().isLatLong().withMessage("Expected format is 'lat,lng'"),
    body('to_name').notEmpty().isString(),
    body('to_address').notEmpty().isString(),
    body('to_location').notEmpty().isLatLong().withMessage("Expected format is 'lat,lng'"),
  ];

  private packageIdValidationChain = () => [
    param('id').notEmpty().isUUID().custom(
      async value => {
        const document = await this.packageService.getOnePackage(value);
        if (!document) {
          throw new Error("Is not a valid package id");
        }
      }
    ),
  ];

  getAllPackages = async (request: Request, response: Response) => {
    response.json(await this.packageService.getAllPackages());
  }

  createPackage = [
    ...this.packageValidationChain(),
    async (request: Request, response: Response, next: NextFunction) => {
      const result = validationResult(request);
      if (!result.isEmpty()) {
        return next(new ApplicationValidationError(result.array()));
      }
      try {
        const {
          from_location: fromLocationString,
          to_location: toLocationString,
          ...rest
        } = matchedData(request) as Omit<CreatePackageDto, "from_location | to_location"> & { from_location: string, to_location: string };
        const [fromLocationLat, fromLocationLng] = fromLocationString.split(',');
        const [toLocationLat, toLocationLng] = toLocationString.split(',');
        return response.status(201).send(await this.packageService.createPackage({
          ...rest,
          from_location: { lat: parseFloat(fromLocationLat), lng: parseFloat(fromLocationLng) },
          to_location: { lat: parseFloat(toLocationLat), lng: parseFloat(toLocationLng) }
        }));
      } catch (error) {
        next(error)
      }
    }
  ];

  getOnePackage = [
    param('id').notEmpty().isUUID(),
    async (request: Request, response: Response, next: NextFunction) => {
      const result = validationResult(request);
      if (!result.isEmpty()) {
        return next(new ApplicationValidationError(result.array()));
      }
      const { id } = matchedData(request) as { id: string };
      const pack = await this.packageService.getOnePackage(id);
      if (pack) return response.status(200).send(pack);
      return next(new DocumentNotFoundError('Package'));
    }
  ];

  updatePackage = [
    ...this.packageIdValidationChain(),
    ...this.packageValidationChain(),
    body('active_delivery_id').optional().isUUID().custom(
      async value => {
        const document = await this.deliveryService.getOneDeliveryById(value);
        if (!document) {
          throw new Error("Is not a valid delivery id");
        }
      }
    ),
    async (request: Request, response: Response, next: NextFunction) => {
      const result = validationResult(request);
      if (!result.isEmpty()) {
        return next(new ApplicationValidationError(result.array()));
      }
      try {
        const {
          id,
          from_location: fromLocationString,
          to_location: toLocationString,
          ...rest
        } = matchedData(request) as Omit<UpdatePackageDto, "from_location | to_location"> & { from_location: string, to_location: string } & { id: string };

        const [fromLocationLat, fromLocationLng] = fromLocationString.split(',');
        const [toLocationLat, toLocationLng] = toLocationString.split(',');

        const pack = await this.packageService.updatePackage(id, {
          ...rest,
          from_location: { lat: parseFloat(fromLocationLat), lng: parseFloat(fromLocationLng) },
          to_location: { lat: parseFloat(toLocationLat), lng: parseFloat(toLocationLng) }
        });

        return response.send(pack);
      } catch (error) {
        next(error)
      }
    }
  ];

  deletePackage = [
    ...this.packageIdValidationChain(),
    async (request: Request, response: Response, next: NextFunction) => {
      const result = validationResult(request);
      if (!result.isEmpty()) {
        return next(new ApplicationValidationError(result.array()));
      }
      try {
        const { id } = matchedData(request) as { id: string };
        return response.send(await this.packageService.deletePackage(id));
      } catch (error) {
        next(error)
      }
    }
  ];
}