import { 
  Controller, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Get, 
  UseGuards, 
  Req, 
  HttpCode, 
  HttpStatus 
} from '@nestjs/common';
import { CartService } from './services/carts.service';
import { OrderService } from './services/orders.service';
import { AddToCartDto, UpdateCartItemQuantityDto } from './dto/cart.dto';
import { CreateOrderDto, CreateTransactionHistoryDto } from './dto/order.dto';

// @UseGuards(JwtAuthGuard) // Bỏ comment dòng này khi bạn đã tích hợp AuthModule
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly cartService: CartService,
    private readonly orderService: OrderService,
  ) {}

  // ==============================================================================
  // 1. NHÓM API QUẢN LÝ GIỎ HÀNG (CART)
  // ==============================================================================

  /**
   * Lấy danh sách sản phẩm trong giỏ hàng
   * GET /orders/cart
   */
  @Get('cart')
  async getCart(@Req() req: any) {
    // GIẢ ĐỊNH: Lấy ma_kh từ token. Trong thực tế sẽ là req.user.ma_kh
    const maKh = req.user?.ma_kh || 'KH_TEST_001'; 
    
    const cartData = await this.cartService.getCart(maKh);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy giỏ hàng thành công',
      data: cartData,
    };
  }

  /**
   * Thêm sản phẩm vào giỏ hàng
   * POST /orders/cart
   */
  @Post('cart')
  @HttpCode(HttpStatus.OK)
  async addToCart(@Req() req: any, @Body() dto: AddToCartDto) {
    const maKh = req.user?.ma_kh || 'KH_TEST_001';
    
    const result = await this.cartService.addToCart(maKh, dto);
    return {
      statusCode: HttpStatus.OK,
      data: result,
    };
  }

  /**
   * Cập nhật số lượng sản phẩm trong giỏ hàng (Tăng/Giảm/Xóa)
   * PATCH /orders/cart/:ma_voucher
   */
  @Patch('cart/:ma_voucher')
  @HttpCode(HttpStatus.OK)
  async updateCartItem(
    @Req() req: any, 
    @Param('ma_voucher') maVoucher: string,
    @Body() dto: UpdateCartItemQuantityDto
  ) {
    const maKh = req.user?.ma_kh || 'KH_TEST_001';
    
    const result = await this.cartService.updateQuantity(maKh, maVoucher, dto);
    return {
      statusCode: HttpStatus.OK,
      data: result,
    };
  }

  // ==============================================================================
  // 2. NHÓM API QUẢN LÝ ĐƠN HÀNG & THANH TOÁN (ORDER & PAYMENT)
  // ==============================================================================

  /**
   * Tạo đơn hàng mới và trả về link thanh toán
   * POST /orders
   */
  @Post()
  async createOrder(@Req() req: any, @Body() dto: CreateOrderDto) {
    const maKh = req.user?.ma_kh || 'KH_TEST_001';
    
    const result = await this.orderService.createOrder(maKh, dto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Khởi tạo đơn hàng thành công',
      data: result,
    };
  }

  /**
   * API Mô phỏng Webhook nhận kết quả từ Cổng thanh toán (MoMo, ZaloPay...)
   * Trong thực tế, API này sẽ được gọi bởi Server của đối tác, không phải từ Client app
   * POST /orders/payment/webhook
   */
  @Post('payment/webhook')
  @HttpCode(HttpStatus.OK)
  async mockPaymentCallback(@Body() dto: CreateTransactionHistoryDto) {
    /* LƯU Ý BẢO MẬT KHI LÀM THỰC TẾ:
      Tại đây, bạn bắt buộc phải có logic verify chữ ký (Signature/Checksum) 
      dựa trên secret_key cung cấp bởi MoMo/VNPay để đảm bảo request này 
      thực sự đến từ cổng thanh toán, không phải do hacker gửi lên giả mạo.
    */

    // Chuyển việc cập nhật trạng thái đơn hàng và lưu lịch sử giao dịch vào Service
    const result = await this.orderService.confirmPaymentCallback(dto);

    // Cổng thanh toán thường yêu cầu server của mình trả về HTTP 200 nhanh chóng
    return {
      statusCode: HttpStatus.OK,
      message: 'Đã nhận thông báo thanh toán',
      data: result
    };
  }
}