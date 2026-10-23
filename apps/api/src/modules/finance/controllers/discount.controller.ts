import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PermissionGuard } from '../../../common/guards/permission.guard';
import { ObjectScopeGuard } from '../../../common/guards/object-scope.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { ObjectScope } from '../../../common/decorators/object-scope.decorator';
import { CurrentUser } from '../../../common/decorators/user.decorator';
import { DiscountService } from '../services/discount.service';
import { AuthUser, toFinanceContext } from '../finance.types';
import { FeeIdParamDto } from '../dto/fee.dto';
import { CreateDiscountDto, DiscountQueryDto, UpdateDiscountDto } from '../dto/discount.dto';

/**
 * P6.2 — Discount endpoints (frozen Finance §9.4 DiscountController, §10.3
 * Discounts). Definition CRUD only.
 *
 * `POST /discounts/:id/apply` and `DELETE /discounts/:id/apply/:applicationId`
 * are intentionally absent: §7.2 scopes discount applications to an invoice and
 * the spec-conformant invoice table is gated behind the Finance legacy-archival
 * decision, so no apply path exists yet.
 */
@ApiTags('finance/discounts')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard, ObjectScopeGuard)
@Controller('finance/discounts')
export class DiscountController {
  constructor(private readonly discounts: DiscountService) {}

  @Get()
  @Permissions('finance:discount:read')
  listDiscounts(@CurrentUser() user: AuthUser, @Query() query: DiscountQueryDto) {
    return this.discounts.listDiscounts(toFinanceContext(user), query);
  }

  @Get(':id')
  @Permissions('finance:discount:read')
  @ObjectScope({ type: 'institution', model: 'discount' })
  getDiscount(@CurrentUser() user: AuthUser, @Param() params: FeeIdParamDto) {
    return this.discounts.getDiscount(toFinanceContext(user), params.id);
  }

  @Post()
  @Permissions('finance:discount:create')
  createDiscount(@CurrentUser() user: AuthUser, @Body() dto: CreateDiscountDto) {
    return this.discounts.createDiscount(toFinanceContext(user), dto);
  }

  @Put(':id')
  @Permissions('finance:discount:update')
  @ObjectScope({ type: 'institution', model: 'discount' })
  updateDiscount(
    @CurrentUser() user: AuthUser,
    @Param() params: FeeIdParamDto,
    @Body() dto: UpdateDiscountDto,
  ) {
    return this.discounts.updateDiscount(toFinanceContext(user), params.id, dto);
  }
}
