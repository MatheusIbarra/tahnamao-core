import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { DeliveryAddressSubdocument, OrderItemSubdocument } from '../../infrastructure/mongo/schemas/order.schema';

export interface OrderCreatedEventPayload {
  orderId: string;
  items: Pick<OrderItemSubdocument, 'menuItemId' | 'quantity' | 'observation' | 'subtotal'>[];
  deliveryAddress: DeliveryAddressSubdocument;
  totalAmount: number;
}

export interface RestaurantSocketOrderEvent {
  event: 'order:new';
  payload: OrderCreatedEventPayload;
}

@WebSocketGateway({
  namespace: '/ws/orders',
  cors: {
    origin: true,
    credentials: true,
  },
})
export class OrdersGateway {
  @WebSocketServer()
  private readonly server!: Server;

  emitNewOrderToRestaurant(restaurantId: string, payload: OrderCreatedEventPayload): void {
    const eventEnvelope: RestaurantSocketOrderEvent = {
      event: 'order:new',
      payload,
    };
    this.server.to(this.restaurantRoom(restaurantId)).emit('restaurant:event', eventEnvelope);
    this.server.to(this.restaurantRoom(restaurantId)).emit('order:new', payload);
  }

  private restaurantRoom(restaurantId: string): string {
    return `restaurant:${restaurantId}`;
  }
}
