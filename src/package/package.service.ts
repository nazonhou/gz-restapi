import { SessionOption } from "mongoose";
import { CreatePackageDto } from "./create-package.dto";
import { Package } from "./package";
import { UpdatePackageDto } from "./update-package.dto";

export class PackageService {
  constructor() {}

  getAllPackages() {
    return Package.find();
  }

  createPackage(dto: CreatePackageDto) {
    return (new Package(dto)).save();
  }

  getOnePackage(id: string) {
    return Package.findById(id);
  }

  updatePackage(id: string, dto: UpdatePackageDto) {
    return Package.findByIdAndUpdate(id, dto, { returnDocument: 'after' });
  }

  deletePackage(id: string) {
    return Package.findOneAndDelete({ _id: id });
  }

  updatePackageActiveDelivery(id: string, active_delivery_id: string, options?: SessionOption) {
    return Package.findByIdAndUpdate(
      id,
      { active_delivery_id },
      { returnDocument: 'after', session: options?.session }
    );
  }
}