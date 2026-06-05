import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { LoginDto, RegisterDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private supabase: SupabaseService) {}

  async signUp(dto: RegisterDto) {
    const { data, error } = await this.supabase.getClient().auth.signUp({
      email: dto.email,
      password: dto.password,
      options: {
        data: { role: dto.role },
      },
    });

    if (error) throw new BadRequestException(error.message);
    return { success: true, data, message: 'Đăng ký thành công' };
  }

  async signIn(dto: LoginDto) {
    const { data, error } = await this.supabase
      .getClient()
      .auth.signInWithPassword({
        email: dto.email,
        password: dto.password,
      });

    if (error) throw new BadRequestException(error.message);
    return { success: true, data, message: 'Đăng nhập thành công' };
  }
}