import { Injectable, Inject, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
  ) {}

  /**
   * 1. Lấy trực thể client gốc của Redis
   * Dùng khi bạn muốn thực hiện các lệnh nâng cao hoặc pipeline/transaction phức tạp
   */
  getClient(): Redis {
    return this.redisClient;
  }

  /**
   * 2. Hàm lưu dữ liệu vào Cache (Tự động chuyển Object thành chuỗi JSON)
   * @param key Khóa lưu trữ
   * @param value Giá trị (chuỗi, số, hoặc object)
   * @param ttl Thời gian sống (Tính bằng GIÂY). Nếu không truyền sẽ lưu vĩnh viễn.
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    if (ttl) {
      await this.redisClient.setex(key, ttl, stringValue);
    } else {
      await this.redisClient.set(key, stringValue);
    }
  }

  /**
   * 3. Hàm lấy dữ liệu từ Cache (Tự động parse JSON về Object/Type ban đầu)
   * @param key Khóa cần lấy
   */
  async get<T>(key: string): Promise<T | null> {
    const data = await this.redisClient.get(key);
    if (!data) return null;

    try {
      // Thử parse xem có phải Object/Array không
      return JSON.parse(data) as T;
    } catch {
      // Nếu không parse được thì trả về chuỗi thô (dành cho string/number)
      return data as unknown as T;
    }
  }

  /**
   * 4. Xóa một hoặc nhiều khóa trong Cache
   * @param key Khóa hoặc mảng các khóa cần xóa
   */
  async del(key: string | string[]): Promise<void> {
    if (Array.isArray(key)) {
      if (key.length > 0) await this.redisClient.del(...key);
    } else {
      await this.redisClient.del(key);
    }
  }

  /**
   * 5. Xóa cache theo cụm sử dụng Pattern (Ví dụ: xóa hết các key bắt đầu bằng "product:*")
   * Rất hữu ích khi bạn cập nhật danh mục và muốn xóa toàn bộ cache của các trang liên quan
   */
  async delByPattern(pattern: string): Promise<void> {
    const stream = this.redisClient.scanStream({
      match: pattern,
      count: 100, // Quét mỗi lượt 100 keys để tránh làm nghẽn Redis
    });

    for await (const keys of stream) {
      if (keys.length > 0) {
        await this.redisClient.del(...keys);
      }
    }
  }

  /**
   * 6. Kiểm tra xem một khóa có tồn tại trong Cache không
   */
  async exists(key: string): Promise<boolean> {
    const result = await this.redisClient.exists(key);
    return result === 1;
  }

  /**
   * 7. Tự động ngắt kết nối an toàn khi module bị hủy (NestJS lifecycle)
   */
  onModuleDestroy() {
    this.redisClient.disconnect();
  }
}