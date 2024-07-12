import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { CoordinatesDto } from "../package/coordinates.dto";
import { DeliveryService } from "../delivery/delivery.service";
import { DeliveryStatus } from "../delivery/delivery";

const deliveryService = new DeliveryService();

export enum SocketEvent {
  LocationChanged = 'location_changed',
  StatusChanged = 'status_changed',
  DeliveryUpdated = 'delivery_updated'
}

export const socketListener = (
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => (socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => {
  console.log('Someone connects');

  socket.on(SocketEvent.LocationChanged, async (payload: { event: string, delivery_id: string, location: CoordinatesDto }) => {
    console.log(payload);

    try {
      const delivery = await deliveryService.updateDeliveryLocation(payload.delivery_id, { location: payload.location });
      io.emit(SocketEvent.DeliveryUpdated, delivery);
    } catch (error) {
      console.error(`[${new Date().toISOString()}]: Handling ${payload.event} failed`, error);
    }
  });

  socket.on(SocketEvent.StatusChanged, async (payload: { event: string, delivery_id: string, status: DeliveryStatus }) => {
    console.log(payload);

    try {
      const delivery = await deliveryService.updateDeliveryStatus(payload.delivery_id, { status: payload.status });
      io.emit(SocketEvent.DeliveryUpdated, delivery);
    } catch (error) {
      console.error(`[${new Date().toISOString()}]: Handling ${payload.event} failed`, error);
    }
  });

  socket.on('disconnect', () => { console.log('Someone disconnects'); });
}