import { Controller, Post, Body } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomerProfileDto } from './dto/customer-profile.dto';

@Controller('api/customers') // Tạo route: POST /api/customers
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  async create(@Body() createCustomerDto: CustomerProfileDto) {
    // DTO đã tự động chặn các request sai định dạng trước khi chạy vào dòng này
    const newCustomer = await this.customersService.createCustomer(createCustomerDto);
    
    return {
      message: 'Tạo khách hàng thành công',
      data: newCustomer,
    };
  }
}