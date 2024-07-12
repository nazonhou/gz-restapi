import { CoordinatesDto } from "./coordinates.dto";

export interface CreatePackageDto {
  description: string;
  weight: number;
  width: number;
  height: number;
  depth: number;
  from_name: string;
  from_address: string;
  from_location: CoordinatesDto;
  to_name: string;
  to_address: string;
  to_location: CoordinatesDto;
}