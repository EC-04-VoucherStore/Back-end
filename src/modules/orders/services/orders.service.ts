// src/modules/orders/services/order.service.ts
import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../../../common/supabase/supabase.service';
import { RedisService } from '../../../common/redis/redis.service';
import { CreateOrderDto } from '../dto/order.dto';
import { TrangThaiThanhToan } from '../interfaces/orders.interface';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto'; // Thư viện lõi sinh chuỗi bảo mật của Node.js

@Injectable()
export class OrderService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * XỬ LÝ TẠO ĐƠN HÀNG CHÍNH VỚI REDIS LOCK & SUPABASE RPC
   */
  async createOrder(maKh: string, dto: CreateOrderDto) {
    const redisClient = this.redisService.getClient();
    const supabase = this.supabaseService.getClient();
    
    // Thiết lập khóa chống click trùng lắp độc nhất cho mỗi khách hàng
    const lockKey = `lock:order:${maKh}`;
    const ttlInMs = 5000; // Khóa trong vòng 5 giây

    // Sử dụng tính năng nguyên tử SET NX PX của Redis để chiếm giữ lock
    const acquireLock = await redisClient.set(lockKey, 'locked', 'PX', ttlInMs, 'NX');

    if (!acquireLock) {
      throw new BadRequestException('Hệ thống đang xử lý đơn hàng trước đó của bạn, vui lòng không click liên tiếp!');
    }

    // Khởi tạo mã đơn hàng chuẩn từ backend để truyền vào RPC
    const maDh = `DH-${uuidv4().substring(0, 8).toUpperCase()}`;

    try {
      // Gọi Stored Procedure (RPC) từ Supabase để đảm bảo kiểm tra kho và ghi đơn hàng chạy dạng Transaction
      const { data: totalAmount, error: rpcError } = await supabase.rpc(
        'create_order_transaction',
        {
          p_ma_dh: maDh,
          p_ma_kh: maKh,
          p_ten_don_hang: dto.ten_don_hang || null,
          p_phuong_thuc_thanh_toan: dto.phuong_thuc_thanh_toan,
          p_items: dto.items, // Tự động map mảng object sang JSONB của Postgres
        }
      );

      // Nếu cơ sở dữ liệu ném ra lỗi (VD: hết kho, sai thông tin), xử lý lỗi ngay
      if (rpcError) {
        throw new BadRequestException(rpcError.message || 'Lỗi xử lý nghiệp vụ đơn hàng tại Database');
      }

      // Xóa sạch các sản phẩm vừa mua khỏi giỏ hàng tạm thời trên Redis
      const voucherIdsToRemove = dto.items.map((item) => item.ma_voucher);
      const cartKey = `cart:${maKh}`;
      await redisClient.hdel(cartKey, ...voucherIdsToRemove);
      await redisClient.sadd('carts_to_sync', maKh); // Đánh dấu đồng bộ giỏ hàng rỗng xuống DB qua Cron Job

      // Thực thi gọi hàm xử lý cổng thanh toán (MoMo, ZaloPay, VNPay...)
      const paymentResult = await this.processPaymentGateway(maDh, totalAmount, dto.phuong_thuc_thanh_toan);

      // Giả lập luồng: Nếu chọn phương thức thanh toán trực tiếp thành công 
      // hoặc sau này nhận Webhook báo Đã Thanh Toán, ta sẽ kích hoạt hàm sinh mã Voucher phát hành cho khách.
      // Ở đây mình gọi trực tiếp để minh họa luồng xử lý toàn vẹn
      await this.generateAndSaveVoucherCodes(maDh, dto.items);

      return {
        message: 'Đơn hàng khởi tạo thành công và đã được bảo vệ thông qua Transaction',
        ma_don_hang: maDh,
        tong_tien: Number(totalAmount),
        thong_tin_thanh_toan: paymentResult,
      };

    } catch (error) {
        const err = error as Error;
      throw new InternalServerErrorException(err.message || 'Lỗi hệ thống bất khả kháng khi xử lý đơn hàng');
    } finally {
      // GIẢI PHÓNG LOCK: Luôn luôn giải phóng khóa Redis dù thành công hay thất bại để người dùng có thể mua tiếp đơn sau
      await redisClient.del(lockKey);
    }
  }

  /**
   * HÀM TỰ SINH MÃ VOUCHER PHÁT HÀNH VÀ LƯU XUỐNG DB
   * Chạy vòng lặp dựa trên số lượng mua thực tế để sinh ra chính xác số lượng code vật lý
   */
  private async generateAndSaveVoucherCodes(maDh: string, items: any[]) {
    const supabase = this.supabaseService.getClient();
    const payloadVoucherPhatHanh: Record<string, any>[] = [];

    for (const item of items) {
      // Người dùng mua bao nhiêu chiếc thì sinh bấy nhiêu bản ghi code độc lập
      for (let i = 0; i < item.so_luong_mua; i++) {
        
        // Sinh chuỗi mã code hiển thị ngẫu nhiên, viết hoa để dễ nhập (VD: VOUCHER-ABCD-1234)
        const randomCode = crypto.randomBytes(4).toString('hex').toUpperCase();
        const maVoucherCode = `VCD-${item.ma_voucher}-${randomCode}`;

        // Tạo chuỗi ký tự mật mã hóa cao băm SHA-256 đóng vai trò chuỗi mã bảo mật của voucher
        const chuoiMaBaoMat = crypto.createHash('sha256')
                                    .update(`${maVoucherCode}-${maDh}-${uuidv4()}`)
                                    .digest('hex');

        payloadVoucherPhatHanh.push({
          ma_voucher_code: maVoucherCode,
          ma_voucher: item.ma_voucher,
          ma_dh: maDh,
          ma_cn: null, // Chưa sử dụng tại chi nhánh nào khi mới mua
          trang_thai: 'CHUA_SU_DUNG',
          ngay_su_dung: null,
          chuoi_ma_bao_mat: chuoiMaBaoMat,
        });
      }
    }

    // Lưu hàng loạt (Bulk Insert) toàn bộ mã voucher phát hành xuống Supabase để tối ưu hiệu năng
    const { error } = await supabase
      .from('voucher_phat_hanh')
      .insert(payloadVoucherPhatHanh);

    if (error) {
      throw new InternalServerErrorException('Lỗi nghiêm trọng khi sinh mã vật lý cho Voucher phát hành: ' + error.message);
    }
  }

  /**
   * GIẢ LẬP KẾT NỐI ĐẾN CỔNG THANH TOÁN ĐỐI TÁC
   */
  private async processPaymentGateway(maDh: string, amount: number, method: string) {
    // Phần này sẽ viết code tích hợp SDK của MoMo, VNPay hay các bên trung gian vào đây
    return {
      url_thanh_toan: `https://mock-gateway.vn/checkout?orderId=${maDh}&amount=${amount}&method=${method}`,
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // Link thanh toán hết hạn sau 15 phút
    };
  }
}


//Còn 2 đoạn phải chỉnh lại là đoạn giả lập luồng thanh toán ở hàm create order và luồng gọi API thanh toán của bên thứ 3