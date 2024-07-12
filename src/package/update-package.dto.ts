import { CreatePackageDto } from "./create-package.dto";

export type UpdatePackageDto = CreatePackageDto & { active_delivery_id: string };