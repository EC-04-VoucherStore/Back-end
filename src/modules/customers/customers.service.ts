import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CustomerProfileDto } from './dto/customer-profile.dto';
import { Customer } from './interfaces/customer.interface';

@Injectable()
export class CustomersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createCustomer(dto: CustomerProfileDto): Promise<Customer> {
    const client = this.supabaseService.getClient(); // Lấy Supabase client

    // Dùng client SDK chọc thẳng vào table 'customers'
    const { data, error } = await client
     .from('customers')
     .insert([
        { 
          full_name: dto.full_name, 
          email: dto.email, 
          phone_number: dto.phone_number 
        }
      ])
     .select() // Yêu cầu Supabase trả về dòng dữ liệu vừa tạo
     .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    // data lúc này sẽ có kiểu dáng của interface Customer
    return data as Customer; 
  }
}