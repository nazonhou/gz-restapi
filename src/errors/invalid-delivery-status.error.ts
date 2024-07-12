import { DeliveryStatus } from "../delivery/delivery";

export class InvalidDeliveryStatusError extends Error {
  constructor(public readonly current: DeliveryStatus, public readonly next: DeliveryStatus) {
    super(`Can not change delivery status from ${current} to ${next}`);
  }
}