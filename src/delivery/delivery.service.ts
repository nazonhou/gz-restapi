import { DocumentNotFoundError } from "../errors/document-not-found.error";
import { InvalidDeliveryStatusError } from "../errors/invalid-delivery-status.error";
import { CreateDeliveryDto } from "./create-delivery.dto";
import { Delivery } from "./delivery";
import { UpdateDeliveryLocationDto } from "./update-delivery-location.dto";
import { UpdateDeliveryStatusDto } from "./update-delivery-status.dto";

export class DeliveryService {
  constructor() {}

  createDelivery(dto: CreateDeliveryDto) {
    return (new Delivery(dto)).save();
  }

  getAllDeliveries() {
    return Delivery.find();
  }

  getOneDeliveryById(id: string) {
    return Delivery.findById(id);
  }

  updateDelivery(id: string, dto: CreateDeliveryDto) {
    return Delivery.findByIdAndUpdate(id, dto, { returnDocument: 'after' });
  }

  deleteDelivery(id: string) {
    return Delivery.findByIdAndDelete(id);
  }

  async updateDeliveryLocation(id: string, dto: UpdateDeliveryLocationDto) {
    const delivery = await Delivery.findById(id);
    if (!delivery) {
      throw new DocumentNotFoundError("Delivery");
    }
    delivery.location = dto.location;
    return delivery.save();
  }

  async updateDeliveryStatus(id: string, dto: UpdateDeliveryStatusDto) {
    const delivery = await Delivery.findById(id);

    if (!delivery) {
      throw new DocumentNotFoundError("Delivery");
    }

    if (delivery.status === "open" && dto.status !== "picked-up") {
      throw new InvalidDeliveryStatusError(delivery.status, dto.status);
    }

    if (delivery.status === "picked-up" && dto.status !== "in-transit") {
      throw new InvalidDeliveryStatusError(delivery.status, dto.status);
    }

    if (delivery.status === "in-transit" && (dto.status !== "delivered" && dto.status !== "failed")) {
      throw new InvalidDeliveryStatusError(delivery.status, dto.status);
    }

    delivery.status = dto.status;

    if (dto.status === 'picked-up') {
      delivery.pickup_time = new Date();
    }

    if (dto.status === 'in-transit') {
      delivery.start_time = new Date();
    }

    if (dto.status === 'delivered' || dto.status === 'failed') {
      delivery.end_time = new Date();
    }

    return delivery.save();
  }
}