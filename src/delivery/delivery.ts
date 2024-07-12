import { randomUUID } from "crypto";
import mongoose, { Schema } from "mongoose";

const DELIVERY_STATUS_VALUES = [
  'open',
  'picked-up',
  'in-transit',
  'delivered',
  'failed'
] as const

export type DeliveryStatus = typeof DELIVERY_STATUS_VALUES[number];

const deliverySchema = new Schema({
  _id: { type: String, default: () => randomUUID().toString() },
  package_id: { type: String, required: true },
  pickup_time: Date,
  start_time: Date,
  end_time: Date,
  location: { lat: Number, lng: Number },
  status: { type: String, enum: DELIVERY_STATUS_VALUES, default: 'open' }
});

export const Delivery = mongoose.model('Delivery', deliverySchema);