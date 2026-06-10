import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';
import { RedisService } from './redis.service';

@Global() // Đảm bảo Module này có thể dùng ở mọi nơi mà không cần import lại
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        // Nếu có biến môi trường REDIS_URL, ioredis sẽ tự động hiểu và bật TLS dựa trên 'rediss://'
        if (process.env.REDIS_URL) {
          return new Redis(process.env.REDIS_URL);
        }
        
        return new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT!) || 6379,
          password: process.env.REDIS_PASSWORD || undefined,
        });
      },
    },
    RedisService
  ],
  exports: ['REDIS_CLIENT', RedisService], // Export để các service khác có thể inject
})
export class RedisModule {}