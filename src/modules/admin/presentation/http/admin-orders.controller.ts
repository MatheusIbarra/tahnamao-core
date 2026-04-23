import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminListOrdersQueryDto } from '../../application/dto/admin-orders.dto';
import { OrdersService } from '../../../orders/application/services/orders.service';

@ApiTags('Admin Orders')
@ApiBearerAuth()
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Lists orders with admin filters and server-side pagination' })
  @ApiResponse({ status: 200, description: 'Orders list returned.' })
  listOrders(
    @Query() query: AdminListOrdersQueryDto,
  ): Promise<{ items: unknown[]; total: number; page: number; limit: number }> {
    return this.ordersService.listAdminOrders({
      status: query.status,
      startDate: query.startDate,
      endDate: query.endDate,
      customer: query.customer,
      driver: query.driver,
      page: query.page,
      limit: query.limit,
    });
  }

  @Get(':orderId')
  @ApiOperation({ summary: 'Returns one order snapshot for admin detail page' })
  @ApiResponse({ status: 200, description: 'Order snapshot returned.' })
  getOrder(@Param('orderId') orderId: string): Promise<unknown> {
    return this.ordersService.getAdminOrderById(orderId);
  }
}
