import { randomUUID } from 'crypto';
import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { CreateOrderDto, CreateOrderResponseDto } from '../dto/create-order.dto';
import { ChangeOrderStatusDto } from '../dto/order-status.dto';
import { UpdateMenuItemDto, UpsertMenuItemDto } from '../dto/menu-item.dto';
import { UpdateRestaurantMediaDto, UpdateRestaurantProfileDto } from '../dto/restaurants.dto';
import { SubmitOrderReviewDto } from '../dto/reviews.dto';
import { ORDER_STATUS_FLOW, OrderPaymentMethod, OrderStatus, RestaurantStatus } from '../../domain/order.enums';
import { MenuItemDocument } from '../../infrastructure/mongo/schemas/menu-item.schema';
import { OrderDocument } from '../../infrastructure/mongo/schemas/order.schema';
import { RestaurantDocument } from '../../infrastructure/mongo/schemas/restaurant.schema';
import { OrderCreatedEventPayload, OrdersGateway } from '../../presentation/websocket/orders.gateway';
import { CustomerDocument } from '../../../customers/infrastructure/mongo/schemas/customer.schema';
import { DriverDocument } from '../../../drivers/infrastructure/mongo/schemas/driver.schema';

type AdminOrderListStatus = 'PENDENTE' | 'EM_ANDAMENTO' | 'ENTREGUE' | 'CANCELADO';

interface ListAdminOrdersInput {
  status?: AdminOrderListStatus;
  startDate?: string;
  endDate?: string;
  customer?: string;
  driver?: string;
  page: number;
  limit: number;
}

interface AdminOrderListItem {
  id: string;
  customerName: string;
  customerEmail: string;
  driverName: string;
  status: AdminOrderListStatus;
  totalAmount: number;
  createdAt: string;
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(OrderDocument.name)
    private readonly orderModel: Model<OrderDocument>,
    @InjectModel(RestaurantDocument.name)
    private readonly restaurantModel: Model<RestaurantDocument>,
    @InjectModel(MenuItemDocument.name)
    private readonly menuItemModel: Model<MenuItemDocument>,
    @InjectModel(CustomerDocument.name)
    private readonly customerModel: Model<CustomerDocument>,
    @InjectModel(DriverDocument.name)
    private readonly driverModel: Model<DriverDocument>,
    private readonly ordersGateway: OrdersGateway,
  ) {}

  async listAdminOrders(
    input: ListAdminOrdersInput,
  ): Promise<{ items: AdminOrderListItem[]; total: number; page: number; limit: number }> {
    const query: FilterQuery<OrderDocument> = {};

    const statusFilter = this.resolveAdminStatusFilter(input.status);
    if (statusFilter.length === 1) {
      query.status = statusFilter[0];
    } else if (statusFilter.length > 1) {
      query.status = { $in: statusFilter };
    }

    if (input.startDate || input.endDate) {
      const createdAtRange: { $gte?: Date; $lte?: Date } = {};
      if (input.startDate) {
        const start = new Date(input.startDate);
        start.setHours(0, 0, 0, 0);
        createdAtRange.$gte = start;
      }
      if (input.endDate) {
        const end = new Date(input.endDate);
        end.setHours(23, 59, 59, 999);
        createdAtRange.$lte = end;
      }
      query.createdAt = createdAtRange;
    }

    const customerTerm = input.customer?.trim();
    if (customerTerm) {
      const pattern = this.buildSafeRegex(customerTerm);
      const customers = await this.customerModel
        .find({
          $or: [{ name: { $regex: pattern, $options: 'i' } }, { email: { $regex: pattern, $options: 'i' } }],
        })
        .select({ _id: 1 })
        .limit(200);
      if (customers.length === 0) {
        return { items: [], total: 0, page: input.page, limit: input.limit };
      }
      query.customerId = { $in: customers.map((customer) => customer.id) };
    }

    const driverTerm = input.driver?.trim();
    if (driverTerm) {
      const pattern = this.buildSafeRegex(driverTerm);
      const drivers = await this.driverModel
        .find({ fullName: { $regex: pattern, $options: 'i' } })
        .select({ _id: 1 })
        .limit(200);
      if (drivers.length === 0) {
        return { items: [], total: 0, page: input.page, limit: input.limit };
      }
      query.assignedDeliverer = { $in: drivers.map((driver) => driver.id) };
    }

    const [orders, total] = await Promise.all([
      this.orderModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip((input.page - 1) * input.limit)
        .limit(input.limit),
      this.orderModel.countDocuments(query),
    ]);

    const customerIds = [...new Set(orders.map((order) => order.customerId).filter(Boolean))];
    const driverIds = [...new Set(orders.map((order) => order.assignedDeliverer).filter(Boolean))];

    const [customers, drivers] = await Promise.all([
      customerIds.length > 0
        ? this.customerModel.find({ _id: { $in: customerIds } }).select({ name: 1, email: 1 })
        : Promise.resolve([]),
      driverIds.length > 0 ? this.driverModel.find({ _id: { $in: driverIds } }).select({ fullName: 1 }) : Promise.resolve([]),
    ]);

    const customerById = new Map(customers.map((customer) => [customer.id, customer]));
    const driverById = new Map(drivers.map((driver) => [driver.id, driver]));

    return {
      items: orders.map((order) => {
        const customer = customerById.get(order.customerId);
        const driver = order.assignedDeliverer ? driverById.get(order.assignedDeliverer) : undefined;
        return {
          id: order.id,
          customerName: customer?.name ?? 'Cliente',
          customerEmail: customer?.email ?? '-',
          driverName: driver?.fullName ?? '-',
          status: this.mapOrderStatusToAdmin(order.status),
          totalAmount: order.totalAmount,
          createdAt: order.createdAt.toISOString(),
        };
      }),
      total,
      page: input.page,
      limit: input.limit,
    };
  }

  async getAdminOrderById(orderId: string): Promise<Record<string, unknown>> {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException('order not found');
    }

    const [customer, driver] = await Promise.all([
      this.customerModel.findById(order.customerId).select({ name: 1, email: 1, phone: 1 }),
      order.assignedDeliverer ? this.driverModel.findById(order.assignedDeliverer).select({ fullName: 1 }) : null,
    ]);

    return {
      id: order.id,
      publicCode: order.publicCode,
      customerName: customer?.name ?? 'Cliente',
      customerEmail: customer?.email ?? '-',
      customerPhone: customer?.phone ?? order.customerPhoneSnapshot ?? '-',
      driverName: driver?.fullName ?? '-',
      status: this.mapOrderStatusToAdmin(order.status),
      paymentMethod: order.paymentMethod,
      totalAmount: order.totalAmount,
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      deliveryAddress: order.deliveryAddress,
      orderNotes: order.orderNotes,
      items: order.items.map((item) => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        observation: item.observation,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
        name: item.nameSnapshot ?? 'Item',
      })),
      statusHistory: order.statusHistory.map((entry) => ({
        from: entry.from,
        status: this.mapOrderStatusToAdmin(entry.status),
        changedAt: entry.changedAt.toISOString(),
      })),
    };
  }

  async listRestaurants(query?: string): Promise<
    Array<{
      id: string;
      name: string;
      image: string;
      logo?: string;
      rating: number;
      reviewCount: number;
      distance: number;
      deliveryTime: string;
      minOrder: number;
      isOpen: boolean;
      category: string;
    }>
  > {
    const filter: Record<string, unknown> = { isActive: true };
    const search = query?.trim();
    if (search) {
      filter.name = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    }

    const restaurants = await this.restaurantModel.find(filter).sort({ name: 1 }).limit(100);
    return restaurants.map((restaurant) => {
      const rating = restaurant.ratingCount > 0 ? restaurant.ratingSum / restaurant.ratingCount : 0;
      return {
        id: restaurant.id,
        name: restaurant.name,
        image: restaurant.media?.bannerUrl ?? '',
        logo: restaurant.media?.logoUrl,
        rating,
        reviewCount: restaurant.ratingCount ?? 0,
        distance: 0,
        deliveryTime: restaurant.delivery?.estimatedTimeText ?? `${restaurant.delivery?.estimatedDeliveryMinutes ?? 35} min`,
        minOrder: (restaurant.delivery?.minOrderValueCents ?? 0) / 100,
        isOpen: restaurant.status === RestaurantStatus.OPEN,
        category: 'Restaurante',
      };
    });
  }

  async getRestaurantWithMenu(
    restaurantId: string,
  ): Promise<{
    restaurant: {
      id: string;
      name: string;
      image: string;
      logo?: string;
      rating: number;
      reviewCount: number;
      distance: number;
      deliveryTime: string;
      minOrder: number;
      isOpen: boolean;
      category: string;
    } | null;
    items: Array<{
      id: string;
      restaurantId: string;
      restaurantName: string;
      name: string;
      description: string;
      image: string;
      price: number;
      discount: number;
    }>;
  }> {
    const restaurant = await this.restaurantModel.findById(restaurantId);
    if (!restaurant || !restaurant.isActive) {
      return { restaurant: null, items: [] };
    }

    const items = await this.menuItemModel
      .find({ restaurantId: restaurant.id, available: true })
      .sort({ sortOrder: 1, name: 1 });

    const rating = restaurant.ratingCount > 0 ? restaurant.ratingSum / restaurant.ratingCount : 0;
    return {
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        image: restaurant.media?.bannerUrl ?? '',
        logo: restaurant.media?.logoUrl,
        rating,
        reviewCount: restaurant.ratingCount ?? 0,
        distance: 0,
        deliveryTime: restaurant.delivery?.estimatedTimeText ?? `${restaurant.delivery?.estimatedDeliveryMinutes ?? 35} min`,
        minOrder: (restaurant.delivery?.minOrderValueCents ?? 0) / 100,
        isOpen: restaurant.status === RestaurantStatus.OPEN,
        category: 'Restaurante',
      },
      items: items.map((item) => ({
        id: item.id,
        restaurantId: item.restaurantId,
        restaurantName: restaurant.name,
        name: item.name,
        description: item.description,
        image: item.imageUrl,
        price: item.price / 100,
        discount: item.discountPercent ?? 0,
      })),
    };
  }

  async listRestaurantMenuItems(restaurantId: string): Promise<
    Array<{
      id: string;
      name: string;
      description: string;
      price: number;
      discount: number;
      image: string | null;
      available: boolean;
    }>
  > {
    const items = await this.menuItemModel.find({ restaurantId }).sort({ sortOrder: 1, name: 1 });
    return items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price / 100,
      discount: item.discountPercent ?? 0,
      image: item.imageUrl ?? null,
      available: item.available,
    }));
  }

  async createRestaurantMenuItem(restaurantId: string, dto: UpsertMenuItemDto): Promise<{ menuItemId: string }> {
    const restaurant = await this.restaurantModel.findById(restaurantId);
    if (!restaurant) {
      throw new NotFoundException('restaurant not found');
    }

    const last = await this.menuItemModel.findOne({ restaurantId }).sort({ sortOrder: -1 }).select('sortOrder');
    const menuItem = await this.menuItemModel.create({
      restaurantId,
      name: dto.name.trim(),
      description: dto.description.trim(),
      imageUrl: dto.imageUrl.trim(),
      price: Math.round(dto.price),
      discountPercent: Math.round(dto.discountPercent ?? 0),
      available: dto.available ?? true,
      sortOrder: (last?.sortOrder ?? 0) + 1,
    });
    return { menuItemId: menuItem.id };
  }

  async updateRestaurantMenuItem(
    restaurantId: string,
    menuItemId: string,
    dto: UpdateMenuItemDto,
  ): Promise<{ success: true }> {
    const item = await this.menuItemModel.findOne({ _id: menuItemId, restaurantId });
    if (!item) {
      throw new NotFoundException('menu item not found');
    }

    if (dto.name !== undefined) item.name = dto.name.trim();
    if (dto.description !== undefined) item.description = dto.description.trim();
    if (dto.imageUrl !== undefined) item.imageUrl = dto.imageUrl.trim();
    if (dto.price !== undefined) item.price = Math.round(dto.price);
    if (dto.discountPercent !== undefined) item.discountPercent = Math.round(dto.discountPercent);
    if (dto.available !== undefined) item.available = dto.available;
    await item.save();
    return { success: true };
  }

  async deleteRestaurantMenuItem(restaurantId: string, menuItemId: string): Promise<{ success: true }> {
    const result = await this.menuItemModel.deleteOne({ _id: menuItemId, restaurantId });
    if (!result.deletedCount) {
      throw new NotFoundException('menu item not found');
    }
    return { success: true };
  }

  async getRestaurantProfile(restaurantId: string): Promise<Record<string, unknown> | null> {
    const restaurant = await this.restaurantModel.findById(restaurantId);
    if (!restaurant) {
      return null;
    }
    return {
      name: restaurant.name,
      document: restaurant.document,
      contactEmail: restaurant.contactEmail,
      contactPhone: restaurant.contactPhone,
      address: restaurant.address,
      delivery: restaurant.delivery,
      operatingHours: restaurant.operatingHours,
      media: restaurant.media,
    };
  }

  async updateRestaurantProfile(restaurantId: string, dto: UpdateRestaurantProfileDto): Promise<{ success: true }> {
    const restaurant = await this.restaurantModel.findById(restaurantId);
    if (!restaurant) {
      throw new NotFoundException('restaurant not found');
    }
    restaurant.name = dto.name.trim();
    restaurant.document = dto.document?.trim();
    restaurant.contactEmail = dto.contactEmail.trim().toLowerCase();
    restaurant.contactPhone = dto.contactPhone.trim();
    restaurant.address = {
      ...dto.address,
      state: dto.address.state.trim().toUpperCase(),
      complement: dto.address.complement?.trim(),
    };
    restaurant.delivery = {
      ...restaurant.delivery,
      ...dto.delivery,
      estimatedTimeText: `${dto.delivery.estimatedDeliveryMinutes} min`,
    };
    restaurant.operatingHours = {
      openWeekdays: dto.operatingHours.openWeekdays,
      openTime: dto.operatingHours.openTime,
      closeTime: dto.operatingHours.closeTime,
    };
    await restaurant.save();
    return { success: true };
  }

  async updateRestaurantMedia(restaurantId: string, dto: UpdateRestaurantMediaDto): Promise<{ success: true }> {
    const restaurant = await this.restaurantModel.findById(restaurantId);
    if (!restaurant) {
      throw new NotFoundException('restaurant not found');
    }
    if (dto.logoUrl !== undefined) {
      restaurant.media.logoUrl = dto.logoUrl;
    }
    if (dto.bannerUrl !== undefined) {
      restaurant.media.bannerUrl = dto.bannerUrl;
    }
    await restaurant.save();
    return { success: true };
  }

  async listOrdersByRestaurant(restaurantId: string): Promise<
    Array<{
      id: string;
      publicCode: string;
      customerName: string;
      phone: string;
      deliveryAddress: string;
      status: OrderStatus;
      createdAt: string;
      paymentMethod: OrderPaymentMethod;
      orderNotes?: string;
      items: Array<{ id: string; name: string; quantity: number; notes?: string }>;
    }>
  > {
    const orders = await this.orderModel.find({ restaurantId }).sort({ createdAt: -1 }).limit(200);
    return orders.map((order) => ({
      id: order.id,
      publicCode: order.publicCode,
      customerName: 'Cliente',
      phone: order.customerPhoneSnapshot ?? '',
      deliveryAddress: order.deliveryAddress.fullText ?? this.formatAddress(order.deliveryAddress),
      status: order.status,
      createdAt: this.formatTime(order.createdAt),
      paymentMethod: order.paymentMethod,
      orderNotes: order.orderNotes,
      items: order.items.map((item, index) => ({
        id: `${order.id}-${index}`,
        name: item.nameSnapshot ?? 'Item',
        quantity: item.quantity,
        notes: item.observation,
      })),
    }));
  }

  async changeOrderStatus(
    restaurantId: string,
    orderId: string,
    dto: ChangeOrderStatusDto,
  ): Promise<{ success: true; order: Record<string, unknown> }> {
    const order = await this.orderModel.findOne({ _id: orderId, restaurantId });
    if (!order) {
      throw new NotFoundException('order not found');
    }
    if (!this.isAllowedTransition(order.status, dto.toStatus)) {
      throw new UnprocessableEntityException('invalid order status transition');
    }

    const from = order.status;
    order.status = dto.toStatus;
    order.statusHistory.push({ from, status: dto.toStatus, changedAt: new Date() });
    if (dto.toStatus === OrderStatus.DELIVERED) {
      order.deliveredAt = new Date();
    }
    await order.save();

    return {
      success: true,
      order: {
        id: order.id,
        publicCode: order.publicCode,
        status: order.status,
        createdAt: this.formatTime(order.createdAt),
      },
    };
  }

  async listMyOrders(customerId: string): Promise<
    Array<{
      id: string;
      publicCode: string;
      status: OrderStatus;
      totalCents: number;
      createdAt: string;
      restaurantId: string;
      restaurantName: string;
    }>
  > {
    const orders = await this.orderModel.find({ customerId }).sort({ createdAt: -1 }).limit(100);
    const restaurantIds = [...new Set(orders.map((order) => order.restaurantId))];
    const restaurants = await this.restaurantModel.find({ _id: { $in: restaurantIds } });
    const restaurantById = new Map(restaurants.map((restaurant) => [restaurant.id, restaurant.name]));

    return orders.map((order) => ({
      id: order.id,
      publicCode: order.publicCode,
      status: order.status,
      totalCents: order.totalAmount,
      createdAt: order.createdAt.toISOString(),
      restaurantId: order.restaurantId,
      restaurantName: restaurantById.get(order.restaurantId) ?? 'Restaurante',
    }));
  }

  async getPublicOrderStatus(publicCode: string): Promise<Record<string, unknown> | { found: false }> {
    const normalized = publicCode.trim().toUpperCase();
    const order = await this.orderModel.findOne({ publicCode: normalized });
    if (!order) {
      return { found: false };
    }
    const restaurant = await this.restaurantModel.findById(order.restaurantId).select('name');
    return {
      found: true,
      publicCode: order.publicCode,
      status: order.status,
      restaurantName: restaurant?.name ?? 'Restaurante',
      paymentMethod: order.paymentMethod,
      totalCents: order.totalAmount,
      deliveryAddressPreview: order.deliveryAddress.fullText ?? this.formatAddress(order.deliveryAddress),
      items: order.items.map((item) => ({
        name: item.nameSnapshot ?? 'Item',
        quantity: item.quantity,
        notes: item.observation,
      })),
      timeline: order.statusHistory.map((entry) => ({
        from: entry.from,
        to: entry.status,
        at: entry.changedAt.toISOString(),
      })),
      updatedAt: order.updatedAt.toISOString(),
    };
  }

  async listPendingOrderReviews(customerId: string): Promise<Array<Record<string, string>>> {
    const orders = await this.orderModel
      .find({
        customerId,
        status: OrderStatus.DELIVERED,
        reviewPromptDismissed: { $ne: true },
        $nor: [{ 'customerReview.stars': { $gte: 1, $lte: 5 } }],
      })
      .sort({ createdAt: 1 })
      .limit(50);
    const restaurantIds = [...new Set(orders.map((order) => order.restaurantId))];
    const restaurants = await this.restaurantModel.find({ _id: { $in: restaurantIds } }).select({ name: 1 });
    const names = new Map(restaurants.map((restaurant) => [restaurant.id, restaurant.name]));
    return orders.map((order) => ({
      orderId: order.id,
      publicCode: order.publicCode,
      restaurantName: names.get(order.restaurantId) ?? 'Restaurante',
      createdAt: order.createdAt.toISOString(),
    }));
  }

  async submitOrderReview(customerId: string, orderId: string, dto: SubmitOrderReviewDto): Promise<{ success: true }> {
    const order = await this.orderModel.findOne({
      _id: orderId,
      customerId,
      status: OrderStatus.DELIVERED,
      reviewPromptDismissed: { $ne: true },
      $nor: [{ 'customerReview.stars': { $gte: 1, $lte: 5 } }],
    });
    if (!order) {
      throw new UnprocessableEntityException('order not found, already reviewed or not delivered');
    }

    order.customerReview = {
      stars: dto.stars,
      comment: dto.comment?.trim(),
      createdAt: new Date(),
    };
    await order.save();

    await this.restaurantModel.updateOne({ _id: order.restaurantId }, { $inc: { ratingSum: dto.stars, ratingCount: 1 } });
    return { success: true };
  }

  async dismissOrderReviewPrompt(customerId: string, orderId: string): Promise<{ success: true }> {
    const result = await this.orderModel.updateOne(
      {
        _id: orderId,
        customerId,
        status: OrderStatus.DELIVERED,
        reviewPromptDismissed: { $ne: true },
      },
      {
        $set: {
          reviewPromptDismissed: true,
        },
      },
    );
    if (!result.matchedCount) {
      throw new NotFoundException('order not found');
    }
    return { success: true };
  }

  async listRestaurantReviews(
    restaurantId: string,
  ): Promise<{ unauthorized: false; reviews: Array<Record<string, unknown>>; ratingAverage: number; ratingCount: number }> {
    const restaurant = await this.restaurantModel.findById(restaurantId).select('ratingSum ratingCount');
    if (!restaurant) {
      throw new NotFoundException('restaurant not found');
    }
    const orders = await this.orderModel
      .find({
        restaurantId,
        'customerReview.stars': { $gte: 1, $lte: 5 },
      })
      .sort({ 'customerReview.createdAt': -1 })
      .limit(200);
    const ratingAverage = restaurant.ratingCount > 0 ? restaurant.ratingSum / restaurant.ratingCount : 0;
    return {
      unauthorized: false,
      reviews: orders.map((order) => ({
        orderPublicCode: order.publicCode,
        stars: order.customerReview?.stars ?? 0,
        comment: order.customerReview?.comment ?? '',
        reviewerFirstName: 'Cliente',
        createdAt: order.customerReview?.createdAt?.toISOString() ?? order.createdAt.toISOString(),
      })),
      ratingAverage,
      ratingCount: restaurant.ratingCount,
    };
  }

  async listPublicRestaurantReviews(restaurantId: string): Promise<Array<Record<string, unknown>>> {
    const orders = await this.orderModel
      .find({ restaurantId, 'customerReview.stars': { $gte: 1, $lte: 5 } })
      .sort({ 'customerReview.createdAt': -1 })
      .limit(100);
    return orders.map((order) => ({
      orderPublicCode: order.publicCode,
      stars: order.customerReview?.stars ?? 0,
      comment: order.customerReview?.comment ?? '',
      reviewerFirstName: 'Cliente',
      createdAt: order.customerReview?.createdAt?.toISOString() ?? order.createdAt.toISOString(),
    }));
  }

  async getBusinessDashboardSummary(restaurantId: string): Promise<Record<string, unknown>> {
    const restaurant = await this.restaurantModel.findById(restaurantId).select('name');
    if (!restaurant) {
      throw new NotFoundException('restaurant not found');
    }

    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    const [ordersTodayCount, revenueAgg] = await Promise.all([
      this.orderModel.countDocuments({ restaurantId, createdAt: { $gte: start, $lte: end } }),
      this.orderModel.aggregate<{ total: number }>([
        {
          $match: {
            restaurantId,
            createdAt: { $gte: start, $lte: end },
            status: { $ne: OrderStatus.CANCELLED },
          },
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ]);
    return {
      establishmentName: restaurant.name,
      ordersTodayCount,
      revenueTodayCents: revenueAgg[0]?.total ?? 0,
      unauthorized: false,
    };
  }

  async createOrder(customerId: string, dto: CreateOrderDto): Promise<CreateOrderResponseDto> {
    const restaurant = await this.restaurantModel.findById(dto.restaurantId);
    if (!restaurant) {
      throw new NotFoundException('restaurant not found');
    }
    if (restaurant.status !== RestaurantStatus.OPEN) {
      throw new UnprocessableEntityException('restaurante fechado: aceite pedidos apenas com status ABERTO');
    }

    const requestedItemIds = dto.items.map((item) => item.menuItemId);
    const menuItems = await this.menuItemModel.find({
      _id: { $in: requestedItemIds },
      restaurantId: dto.restaurantId,
      available: true,
    });

    const menuItemById = new Map(menuItems.map((item) => [item.id, item]));
    const invalidItemId = requestedItemIds.find((menuItemId) => !menuItemById.has(menuItemId));
    if (invalidItemId) {
      throw new UnprocessableEntityException(
        `item indisponivel ou nao pertence ao restaurante: ${invalidItemId}`,
      );
    }

    const orderItems = dto.items.map((item) => {
      const menuItem = menuItemById.get(item.menuItemId);
      if (!menuItem) {
        throw new UnprocessableEntityException(
          `item indisponivel ou nao pertence ao restaurante: ${item.menuItemId}`,
        );
      }

      const lineSubtotal = menuItem.price * item.quantity;
      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        observation: item.observation,
        unitPrice: menuItem.price,
        subtotal: lineSubtotal,
        nameSnapshot: menuItem.name,
        discountPercentSnapshot: menuItem.discountPercent ?? 0,
      };
    });

    const subtotal = orderItems.reduce((acc, item) => acc + item.subtotal, 0);
    const deliveryFee = 0;
    const totalAmount = subtotal + deliveryFee;
    const publicCode = await this.generateUniquePublicCode();

    const order = await this.orderModel.create({
      publicCode,
      customerId,
      restaurantId: dto.restaurantId,
      items: orderItems,
      deliveryAddress: {
        ...dto.deliveryAddress,
        fullText: this.formatAddress(dto.deliveryAddress),
      },
      paymentMethod: dto.paymentMethod as OrderPaymentMethod,
      subtotal,
      deliveryFee,
      totalAmount,
      status: OrderStatus.PENDING,
      customerPhoneSnapshot: dto.customerPhoneSnapshot,
      orderNotes: dto.orderNotes?.trim() || undefined,
      statusHistory: [
        {
          from: undefined,
          status: OrderStatus.PENDING,
          changedAt: new Date(),
        },
      ],
      assignedDeliverer: null,
    });

    const eventPayload: OrderCreatedEventPayload = {
      orderId: order.id,
      items: order.items.map((item) => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        observation: item.observation,
        subtotal: item.subtotal,
      })),
      deliveryAddress: order.deliveryAddress,
      totalAmount: order.totalAmount,
    };
    this.ordersGateway.emitNewOrderToRestaurant(dto.restaurantId, eventPayload);

    return {
      orderId: order.id,
      status: OrderStatus.PENDING,
      publicCode: order.publicCode,
    };
  }

  private formatAddress(address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  }): string {
    const complement = address.complement?.trim() ? `, ${address.complement.trim()}` : '';
    return `${address.street}, ${address.number}${complement} - ${address.neighborhood}, ${address.city}/${address.state}, ${address.zipCode}`;
  }

  private formatTime(date?: Date): string {
    if (!date) {
      return '';
    }
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  private isAllowedTransition(from: OrderStatus, to: OrderStatus): boolean {
    if (from === to) {
      return true;
    }
    if (to === OrderStatus.CANCELLED) {
      return from !== OrderStatus.DELIVERED && from !== OrderStatus.OUT_FOR_DELIVERY;
    }

    const fromIndex = ORDER_STATUS_FLOW.indexOf(from);
    const toIndex = ORDER_STATUS_FLOW.indexOf(to);
    if (fromIndex === -1 || toIndex === -1) {
      return false;
    }
    return toIndex === fromIndex + 1 || toIndex === fromIndex - 1;
  }

  private async generateUniquePublicCode(): Promise<string> {
    for (let attempt = 0; attempt < 12; attempt++) {
      const candidate = `TNM-${randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`;
      const exists = await this.orderModel.exists({ publicCode: candidate });
      if (!exists) {
        return candidate;
      }
    }
    return `TNM-${randomUUID().replace(/-/g, '').slice(0, 20).toUpperCase()}`;
  }

  private buildSafeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private resolveAdminStatusFilter(status?: AdminOrderListStatus): OrderStatus[] {
    if (!status) {
      return [];
    }
    const normalized = status.trim().toUpperCase();
    if (normalized === 'PENDENTE') {
      return [OrderStatus.PENDING];
    }
    if (normalized === 'EM_ANDAMENTO') {
      return [OrderStatus.ACCEPTED, OrderStatus.PREPARING, OrderStatus.OUT_FOR_DELIVERY];
    }
    if (normalized === 'ENTREGUE') {
      return [OrderStatus.DELIVERED];
    }
    if (normalized === 'CANCELADO') {
      return [OrderStatus.CANCELLED];
    }
    return [];
  }

  private mapOrderStatusToAdmin(status: OrderStatus): AdminOrderListStatus {
    if (status === OrderStatus.PENDING) {
      return 'PENDENTE';
    }
    if (status === OrderStatus.ACCEPTED || status === OrderStatus.PREPARING || status === OrderStatus.OUT_FOR_DELIVERY) {
      return 'EM_ANDAMENTO';
    }
    if (status === OrderStatus.DELIVERED) {
      return 'ENTREGUE';
    }
    return 'CANCELADO';
  }
}
