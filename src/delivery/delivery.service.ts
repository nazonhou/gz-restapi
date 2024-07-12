import { Database } from "../database";
import { DocumentNotFoundError } from "../errors/document-not-found.error";
import { InvalidDeliveryStatusError } from "../errors/invalid-delivery-status.error";
import { Package } from "../package/package";
import { CreateDeliveryDto } from "./create-delivery.dto";
import { Delivery } from "./delivery";
import { UpdateDeliveryLocationDto } from "./update-delivery-location.dto";
import { UpdateDeliveryStatusDto } from "./update-delivery-status.dto";


export class DeliveryService {
  constructor() {}

  async createDelivery(dto: CreateDeliveryDto) {
    const session = await Database.mongoose.startSession();
    session.startTransaction();

    try {
      const delivery = await (new Delivery(dto)).save({ session });
      await Package.findByIdAndUpdate(
        delivery.package_id,
        { active_delivery_id: delivery._id },
        { session }
      );
      await session.commitTransaction();
      session.endSession();
      return delivery;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }

  }

  getAllDeliveries() {
    return Delivery.find();
  }

  getOneDeliveryById(id: string) {
    return Delivery.findById(id);
  }

  async updateDelivery(id: string, dto: CreateDeliveryDto) {
    const deliveryBeforeUpdate = await Delivery.findById(id);

    const session = await Database.mongoose.startSession();
    session.startTransaction();

    try {
      const deliverAfterUpdate = await Delivery.findByIdAndUpdate(
        id,
        dto,
        { returnDocument: 'after', session }
      );

      if (deliveryBeforeUpdate?.package_id !== dto.package_id) {
        await Package.updateOne(
          { _id: deliveryBeforeUpdate?.package_id },
          { $unset: { active_delivery_id: 1 } },
          { session }
        );

        await Package.findByIdAndUpdate(
          dto.package_id,
          { active_delivery_id: id },
          { session }
        );
      }

      await session.commitTransaction();
      session.endSession();

      return deliverAfterUpdate;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      throw error;
    }
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

  getActiveDeliveriesByPackageId(package_id: string) {
    return Delivery.find({
      package_id,
      status: { $nin: ['failed', 'delivered'] }
    });
  }
}