import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { RedisService } from '../../../common/redis/redis.service';
import { AddToCartDto, UpdateCartItemQuantityDto } from '../dto/cart.dto';
import { SupabaseService } from 'src/common/supabase/supabase.service';

@Injectable()
export class CartService {
  private readonly DIRTY_SET_KEY = 'carts_to_sync'; // Nơi chứa các ma_kh cần đồng bộ

  constructor(private readonly redisService: RedisService, 
    private readonly supabaseService: SupabaseService
  ) {}

  private getCartKey(maKh: string): string {
    return `cart:${maKh}`;
  }

  /**
   * Đánh dấu giỏ hàng của user này cần được đồng bộ xuống DB
   */
  private async markCartAsDirty(maKh: string) {
    const client = this.redisService.getClient();
    await client.sadd(this.DIRTY_SET_KEY, maKh);
  }

  async addToCart(maKh: string, dto: AddToCartDto) {
    const cartKey = this.getCartKey(maKh);
    const client = this.redisService.getClient();

    try {
      const currentQuantity = await client.hincrby(cartKey, dto.ma_voucher, dto.so_luong_mua);
      await this.markCartAsDirty(maKh); // <-- Đánh dấu cần đồng bộ

      return {
        message: 'Đã thêm vào giỏ hàng',
        ma_voucher: dto.ma_voucher,
        so_luong_hien_tai: currentQuantity,
      };
    } catch (error) {
      throw new InternalServerErrorException('Lỗi khi thêm vào giỏ hàng cache');
    }
  }

  async updateQuantity(maKh: string, maVoucher: string, dto: UpdateCartItemQuantityDto) {
    const cartKey = this.getCartKey(maKh);
    const client = this.redisService.getClient();

    try {
      if (dto.so_luong_mua <= 0) {
        await client.hdel(cartKey, maVoucher);
      } else {
        await client.hset(cartKey, maVoucher, dto.so_luong_mua);
      }

      await this.markCartAsDirty(maKh); // <-- Đánh dấu cần đồng bộ

      return {
        message: 'Cập nhật giỏ hàng thành công',
        ma_voucher: maVoucher,
        so_luong_moi: Math.max(0, dto.so_luong_mua),
      };
    } catch (error) {
      throw new InternalServerErrorException('Lỗi khi cập nhật giỏ hàng cache');
    }
  }

  async getCart(maKh: string) {
    const cartKey = this.getCartKey(maKh);
    const client = this.redisService.getClient();
    
    // Bước 1: Thử lấy dữ liệu từ Redis
    const cartData: Record<string, string> = await client.hgetall(cartKey);

    // CACHE HIT: Dữ liệu đang nóng trên Redis
    if (Object.keys(cartData).length > 0) {
      return Object.entries(cartData).map(([maVoucher, soLuong]) => ({
        ma_voucher: maVoucher,
        so_luong_mua: parseInt(soLuong, 10)
      }));
    }

    // Bước 2: CACHE MISS - Redis rỗng, đi xuống Supabase tìm kiếm
    const supabase = this.supabaseService.getClient();
    const { data: dbCart, error } = await supabase
      .from('chi_tiet_gio_hang')
      .select('ma_voucher, so_luong_mua')
      .eq('ma_kh', maKh);

    if (error) {
      throw new InternalServerErrorException('Lỗi khi truy vấn giỏ hàng từ Database');
    }

    // Nếu DB cũng rỗng, nghĩa là khách hàng thực sự chưa mua gì
    if (!dbCart || dbCart.length === 0) {
      return [];
    }

    // Bước 3: HYDRATION - Phục hồi Cache (Đẩy dữ liệu từ DB ngược lên Redis)
    const pipeline = client.pipeline();
    const formattedCart: Record<string, any>[] = [];

    for (const item of dbCart) {
      pipeline.hset(cartKey, item.ma_voucher, item.so_luong_mua);
      formattedCart.push({
        ma_voucher: item.ma_voucher,
        so_luong_mua: item.so_luong_mua
      });
    }

    pipeline.expire(cartKey, 7 * 24 * 60 * 60); // Đặt lại TTL 7 ngày
    await pipeline.exec();

    return formattedCart;
  }
}