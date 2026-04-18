import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminListCustomersQueryDto } from '../../application/dto/admin-customers.dto';
import { CustomersService } from '../../../customers/application/services/customers.service';

@ApiTags('Admin Customers')
@ApiBearerAuth()
@Controller('admin/clients')
export class AdminCustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @ApiOperation({ summary: 'Lists customers with name/email filters and pagination' })
  @ApiResponse({ status: 200, description: 'Customers list returned.' })
  listCustomers(
    @Query() query: AdminListCustomersQueryDto,
  ): Promise<{ items: unknown[]; total: number; page: number; limit: number }> {
    return this.customersService.listAdminCustomers({
      name: query.name,
      email: query.email,
      page: query.page,
      limit: query.limit,
    });
  }

  @Get(':customerId')
  @ApiOperation({ summary: 'Returns a customer snapshot for admin usage' })
  @ApiResponse({ status: 200, description: 'Customer snapshot returned.' })
  getCustomer(@Param('customerId') customerId: string): Promise<unknown> {
    return this.customersService.getAdminCustomerById(customerId);
  }

  @Post(':customerId/block')
  @ApiOperation({ summary: 'Blocks a customer from authentication' })
  @ApiResponse({ status: 200, description: 'Customer blocked.' })
  async blockCustomer(@Param('customerId') customerId: string): Promise<{ status: 'ok' }> {
    await this.customersService.blockCustomer(customerId);
    return { status: 'ok' };
  }

  @Post(':customerId/unblock')
  @ApiOperation({ summary: 'Unblocks a customer authentication' })
  @ApiResponse({ status: 200, description: 'Customer unblocked.' })
  async unblockCustomer(@Param('customerId') customerId: string): Promise<{ status: 'ok' }> {
    await this.customersService.unblockCustomer(customerId);
    return { status: 'ok' };
  }
}
