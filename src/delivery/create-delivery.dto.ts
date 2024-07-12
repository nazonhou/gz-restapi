import { CoordinatesDto } from "../package/coordinates.dto";

export interface CreateDeliveryDto {
  package_id: string;
  location: CoordinatesDto;
}