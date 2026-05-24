import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';

import { VouchersService } from './vouchers.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';

@Controller('vouchers')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Get()
  getAllVouchers() {
    return this.vouchersService.getAllVouchers();
  }

  @Get('search/filter')
  searchVouchers( 
     @Query() query: any,
  ) {
    return this.vouchersService.searchVoucher(query);
  } 

  @Get(':id')
  getVoucherByID(@Param('id') id: string) {
    return this.vouchersService.getVoucherbyID(id);
  }

  @Post()
  create(@Body() dto: CreateVoucherDto) {
    return this.vouchersService.createVoucher(dto);
  }

  @Post(':id/submit')
  submitVoucher(@Param('id') id: string) {
    return this.vouchersService.submitVoucher(id);
  }

  @Post(':id/approve')
  approveVoucher(@Param('id') id: string) {
    return this.vouchersService.approveVoucher(id);
  }

  @Post(':id/reject')
  rejectVoucher(@Param('id') id: string) {
    return this.vouchersService.rejectVoucher(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() payload: any) {
    return this.vouchersService.updateVoucher(id, payload);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vouchersService.removeVoucher(id);
  }
}
