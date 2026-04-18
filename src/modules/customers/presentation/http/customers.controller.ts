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
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CreateCustomerAddressDto,
  CustomerAddressResponseDto,
  CustomerProfileResponseDto,
  RegisterCustomerDto,
  UpdateCustomerAddressDto,
  UpdateCustomerProfileDto,
} from '../../application/dto/customers.dto';
import { CustomerAddressesService } from '../../application/services/customer-addresses.service';
import { CustomersService } from '../../application/services/customers.service';
import { CurrentCustomer } from './decorators/current-customer.decorator';
import { CustomerAuthGuard } from './guards/customer-auth.guard';

@ApiTags('Customers')
@Controller('customers')
export class CustomersController {
  constructor(
    private readonly customersService: CustomersService,
    private readonly customerAddressesService: CustomerAddressesService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registers a customer account' })
  @ApiResponse({ status: 201, type: CustomerProfileResponseDto })
  register(@Body() dto: RegisterCustomerDto): Promise<CustomerProfileResponseDto> {
    return this.customersService.register(dto);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(CustomerAuthGuard)
  @ApiOperation({ summary: 'Returns current customer profile' })
  @ApiResponse({ status: 200, type: CustomerProfileResponseDto })
  getMe(@CurrentCustomer() user: { userId: string }): Promise<CustomerProfileResponseDto> {
    return this.customersService.getProfile(user.userId);
  }

  @Patch('me')
  @ApiBearerAuth()
  @UseGuards(CustomerAuthGuard)
  @ApiOperation({ summary: 'Updates current customer profile' })
  @ApiResponse({ status: 200, type: CustomerProfileResponseDto })
  updateMe(
    @CurrentCustomer() user: { userId: string },
    @Body() dto: UpdateCustomerProfileDto,
  ): Promise<CustomerProfileResponseDto> {
    return this.customersService.updateProfile(user.userId, dto);
  }

  @Post('me/addresses')
  @ApiBearerAuth()
  @UseGuards(CustomerAuthGuard)
  @ApiOperation({ summary: 'Creates a customer address' })
  @ApiResponse({ status: 201, type: CustomerAddressResponseDto })
  createAddress(
    @CurrentCustomer() user: { userId: string },
    @Body() dto: CreateCustomerAddressDto,
  ): Promise<CustomerAddressResponseDto> {
    return this.customerAddressesService.create(user.userId, dto);
  }

  @Get('me/addresses')
  @ApiBearerAuth()
  @UseGuards(CustomerAuthGuard)
  @ApiOperation({ summary: 'Lists customer active addresses' })
  @ApiResponse({ status: 200, type: [CustomerAddressResponseDto] })
  listAddresses(@CurrentCustomer() user: { userId: string }): Promise<CustomerAddressResponseDto[]> {
    return this.customerAddressesService.list(user.userId);
  }

  @Get('me/addresses/:id')
  @ApiBearerAuth()
  @UseGuards(CustomerAuthGuard)
  @ApiOperation({ summary: 'Gets a specific customer address' })
  @ApiResponse({ status: 200, type: CustomerAddressResponseDto })
  getAddress(
    @CurrentCustomer() user: { userId: string },
    @Param('id') addressId: string,
  ): Promise<CustomerAddressResponseDto> {
    return this.customerAddressesService.getById(user.userId, addressId);
  }

  @Patch('me/addresses/:id')
  @ApiBearerAuth()
  @UseGuards(CustomerAuthGuard)
  @ApiOperation({ summary: 'Updates a customer address' })
  @ApiResponse({ status: 200, type: CustomerAddressResponseDto })
  updateAddress(
    @CurrentCustomer() user: { userId: string },
    @Param('id') addressId: string,
    @Body() dto: UpdateCustomerAddressDto,
  ): Promise<CustomerAddressResponseDto> {
    return this.customerAddressesService.update(user.userId, addressId, dto);
  }

  @Delete('me/addresses/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @UseGuards(CustomerAuthGuard)
  @ApiOperation({ summary: 'Soft deletes a customer address' })
  @ApiResponse({ status: 204, description: 'Address removed.' })
  async removeAddress(
    @CurrentCustomer() user: { userId: string },
    @Param('id') addressId: string,
  ): Promise<void> {
    await this.customerAddressesService.remove(user.userId, addressId);
  }

  @Patch('me/addresses/:id/default')
  @ApiBearerAuth()
  @UseGuards(CustomerAuthGuard)
  @ApiOperation({ summary: 'Sets one customer address as default' })
  @ApiResponse({ status: 200, type: CustomerAddressResponseDto })
  setDefaultAddress(
    @CurrentCustomer() user: { userId: string },
    @Param('id') addressId: string,
  ): Promise<CustomerAddressResponseDto> {
    return this.customerAddressesService.setDefault(user.userId, addressId);
  }
}
