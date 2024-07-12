import { randomUUID } from "crypto";
import { Database } from "../database";
import { Schema } from "mongoose";
import { Delivery } from "../delivery/delivery";

const packageSchema = new Schema({
  _id: { type: String, default: () => randomUUID().toString() },
  active_delivery_id: String,
  description: String,
  weight: Number,
  width: Number,
  height: Number,
  depth: Number,
  from_name: String,
  from_address: String,
  from_location: { lat: Number, lng: Number },
  to_name: String,
  to_address: String,
  to_location: { lat: Number, lng: Number }
});

packageSchema.pre('findOneAndDelete', async function () {
  const { _id } = this.getFilter() as { _id: string };
  await Delivery.deleteMany({ package_id: _id });
});

export const Package = Database.mongoose.model('Package', packageSchema);