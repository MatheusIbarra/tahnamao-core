import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateOrderDto, CreateOrderResponseDto } from '../../application/dto/create-order.dto';
import { ChangeOrderStatusDto } from '../../application/dto/order-status.dto';
import { UpdateMenuItemDto, UpsertMenuItemDto } from '../../application/dto/menu-item.dto';
import { SubmitOrderReviewDto } from '../../application/dto/reviews.dto';
import { RestaurantsQueryDto, UpdateRestaurantMediaDto, UpdateRestaurantProfileDto } from '../../application/dto/restaurants.dto';
import { OrdersService } from '../../application/services/orders.service';

@ApiTags('Orders')
@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('/restaurants')
  @ApiOperation({ summary: 'Lists active restaurants for marketplace catalog' })
  listRestaurants(@Query() query: RestaurantsQueryDto) {
    return this.ordersService.listRestaurants(query.q);
  }

  @Get('/restaurants/:restaurantId')
  @ApiOperation({ summary: 'Returns one restaurant with available menu items' })
  getRestaurantWithMenu(@Param('restaurantId') restaurantId: string) {
    return this.ordersService.getRestaurantWithMenu(restaurantId);
  }

  @Get('/restaurants/:restaurantId/reviews')
  @ApiOperation({ summary: 'Lists public restaurant reviews' })
  listPublicRestaurantReviews(@Param('restaurantId') restaurantId: string) {
    return this.ordersService.listPublicRestaurantReviews(restaurantId);
  }

  @Post('/orders')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Creates a new customer order' })
  @ApiResponse({ status: 201, type: CreateOrderResponseDto })
  @ApiResponse({ status: 422, description: 'Restaurant closed or invalid/unavailable menu item.' })
  createOrder(@Body() dto: CreateOrderDto): Promise<CreateOrderResponseDto> {
    return this.ordersService.createOrder(dto.customerId, dto);
  }

  @Get('/orders/public/:publicCode')
  @ApiOperation({ summary: 'Gets public order status by tracking code' })
  getPublicOrderStatus(@Param('publicCode') publicCode: string) {
    return this.ordersService.getPublicOrderStatus(publicCode);
  }

  @Get('/orders/me')
  @ApiOperation({ summary: 'Lists authenticated customer orders' })
  listMyOrders(@Query('customerId') customerId: string) {
    return this.ordersService.listMyOrders(customerId);
  }

  @Get('/orders/me/pending-reviews')
  @ApiOperation({ summary: 'Lists delivered orders waiting for customer review' })
  listPendingReviews(@Query('customerId') customerId: string) {
    return this.ordersService.listPendingOrderReviews(customerId);
  }

  @Post('/orders/:orderId/reviews')
  @ApiOperation({ summary: 'Submits customer review for delivered order' })
  submitOrderReview(
    @Query('customerId') customerId: string,
    @Param('orderId') orderId: string,
    @Body() dto: SubmitOrderReviewDto,
  ) {
    return this.ordersService.submitOrderReview(customerId, orderId, dto);
  }

  @Post('/orders/:orderId/reviews/dismiss')
  @ApiOperation({ summary: 'Dismisses review prompt for one delivered order' })
  dismissReviewPrompt(@Query('customerId') customerId: string, @Param('orderId') orderId: string) {
    return this.ordersService.dismissOrderReviewPrompt(customerId, orderId);
  }

  @Get('/business/restaurants/:restaurantId/profile')
  @ApiOperation({ summary: 'Gets restaurant business profile' })
  getRestaurantProfile(@Param('restaurantId') restaurantId: string) {
    return this.ordersService.getRestaurantProfile(restaurantId);
  }

  @Patch('/business/restaurants/:restaurantId/profile')
  @ApiOperation({ summary: 'Updates restaurant business profile' })
  updateRestaurantProfile(@Param('restaurantId') restaurantId: string, @Body() dto: UpdateRestaurantProfileDto) {
    return this.ordersService.updateRestaurantProfile(restaurantId, dto);
  }

  @Patch('/business/restaurants/:restaurantId/media')
  @ApiOperation({ summary: 'Updates restaurant media URLs' })
  updateRestaurantMedia(@Param('restaurantId') restaurantId: string, @Body() dto: UpdateRestaurantMediaDto) {
    return this.ordersService.updateRestaurantMedia(restaurantId, dto);
  }

  @Get('/business/restaurants/:restaurantId/menu-items')
  @ApiOperation({ summary: 'Lists all restaurant menu items for business area' })
  listRestaurantMenuItems(@Param('restaurantId') restaurantId: string) {
    return this.ordersService.listRestaurantMenuItems(restaurantId);
  }

  @Post('/business/restaurants/:restaurantId/menu-items')
  @ApiOperation({ summary: 'Creates one menu item for restaurant' })
  createRestaurantMenuItem(@Param('restaurantId') restaurantId: string, @Body() dto: UpsertMenuItemDto) {
    return this.ordersService.createRestaurantMenuItem(restaurantId, dto);
  }

  @Patch('/business/restaurants/:restaurantId/menu-items/:menuItemId')
  @ApiOperation({ summary: 'Updates one menu item for restaurant' })
  updateRestaurantMenuItem(
    @Param('restaurantId') restaurantId: string,
    @Param('menuItemId') menuItemId: string,
    @Body() dto: UpdateMenuItemDto,
  ) {
    return this.ordersService.updateRestaurantMenuItem(restaurantId, menuItemId, dto);
  }

  @Delete('/business/restaurants/:restaurantId/menu-items/:menuItemId')
  @ApiOperation({ summary: 'Deletes one menu item for restaurant' })
  deleteRestaurantMenuItem(@Param('restaurantId') restaurantId: string, @Param('menuItemId') menuItemId: string) {
    return this.ordersService.deleteRestaurantMenuItem(restaurantId, menuItemId);
  }

  @Get('/business/restaurants/:restaurantId/orders')
  @ApiOperation({ summary: 'Lists restaurant orders for business area' })
  listOrdersByRestaurant(@Param('restaurantId') restaurantId: string) {
    return this.ordersService.listOrdersByRestaurant(restaurantId);
  }

  @Patch('/business/restaurants/:restaurantId/orders/:orderId/status')
  @ApiOperation({ summary: 'Changes one restaurant order status' })
  changeOrderStatus(
    @Param('restaurantId') restaurantId: string,
    @Param('orderId') orderId: string,
    @Body() dto: ChangeOrderStatusDto,
  ) {
    return this.ordersService.changeOrderStatus(restaurantId, orderId, dto);
  }

  @Get('/business/restaurants/:restaurantId/reviews')
  @ApiOperation({ summary: 'Lists restaurant reviews for business area' })
  listRestaurantReviews(@Param('restaurantId') restaurantId: string) {
    return this.ordersService.listRestaurantReviews(restaurantId);
  }

  @Get('/business/restaurants/:restaurantId/dashboard-summary')
  @ApiOperation({ summary: 'Gets restaurant dashboard summary' })
  getDashboardSummary(@Param('restaurantId') restaurantId: string) {
    return this.ordersService.getBusinessDashboardSummary(restaurantId);
  }
}
