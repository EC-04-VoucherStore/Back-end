import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { RedisService } from '../../common/redis/redis.service';
import { AddToCartDto, UpdateCartItemQuantityDto } from '../dto/cart.dto';

@Injectable()
export class CartService {
  private readonly DIRTY_SET_KEY = 'carts_to_sync'; // Nơi chứa các ma_kh cần đồng bộ

  constructor(private readonly redisService: RedisService) {}

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
    const cartData = await client.hgetall(cartKey);
    
    return Object.entries(cartData).map(([maVoucher, soLuong]) => ({
      ma_voucher: maVoucher,
      so_luong_mua: parseInt(soLuong, 10)
    }));
  }
}