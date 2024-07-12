import mongoose, { Mongoose } from "mongoose";
import { envs } from "./config/env";

export class Database {
  private static _mongoose: Mongoose;

  static async connect() {
    try {
      this._mongoose = await mongoose.connect(envs.MONGO_URL, { dbName: envs.MONGO_DATABASE });      
    } catch (error) {
      console.error(error);
      throw new Error("Unable to connect to database");
    }
  }

  static get mongoose(): Mongoose {
    return this._mongoose;
  }
}