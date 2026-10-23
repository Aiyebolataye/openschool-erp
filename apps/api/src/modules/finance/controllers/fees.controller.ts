import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PermissionGuard } from '../../../common/guards/permission.guard';
import { ObjectScopeGuard } from '../../../common/guards/object-scope.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { ObjectScope } from '../../../common/decorators/object-scope.decorator';
import { CurrentUser } from '../../../common/decorators/user.decorator';
import { FeeStructureService } from '../services/fees.service';
import { AuthUser, toFinanceContext } from '../finance.types';
import {
  CreateFeeCategoryDto,
  CreateFeeItemDto,
  FeeIdParamDto,
  FeeItemQueryDto,
  FeeQueryDto,
  UpdateFeeCategoryDto,
  UpdateFeeItemDto,
} from '../dto/fee.dto';
import {
  AddFeeScheduleItemDto,
  CreateFeeScheduleDto,
  FeeScheduleQueryDto,
  ScheduleItemParamDto,
  UpdateFeeScheduleDto,
} from '../dto/schedule.dto';

/**
 * P6.1 / P6.2 — Fee structure endpoints (frozen Finance §9.4 FeeStructureController,
 * §10.3 Fee Categories / Fee Items / Fee Schedules). AuthZ: AuthGuard('jwt') +
 * PermissionGuard on the finance:fee_category / finance:fee_item /
 * finance:fee_schedule catalogue + ObjectScopeGuard (institution-scoped,
 * fail-closed). Tenant and institution come from the JWT.
 */
@ApiTags('finance/fees')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard, ObjectScopeGuard)
@Controller('finance/fees')
export class FeeStructureController {
  constructor(private readonly fees: FeeStructureService) {}

  // ------------------------------------------------------------- categories
  @Post('categories')
  @Permissions('finance:fee_category:create')
  createCategory(@CurrentUser() user: AuthUser, @Body() dto: CreateFeeCategoryDto) {
    return this.fees.createCategory(toFinanceContext(user), dto);
  }

  @Get('categories')
  @Permissions('finance:fee_category:read')
  listCategories(
    @CurrentUser() user: AuthUser,
    @Query() query: FeeQueryDto,
  ) {
    return this.fees.listCategories(
      toFinanceContext(user),
      query.page,
      query.limit,
    );
  }

  @Put('categories/:id')
  @Permissions('finance:fee_category:update')
  @ObjectScope({ type: 'institution', model: 'feeCategory' })
  updateCategory(
    @CurrentUser() user: AuthUser,
    @Param() params: FeeIdParamDto,
    @Body() dto: UpdateFeeCategoryDto,
  ) {
    return this.fees.updateCategory(toFinanceContext(user), params.id, dto);
  }

  // ------------------------------------------------------------------ items
  @Post('items')
  @Permissions('finance:fee_item:create')
  createItem(@CurrentUser() user: AuthUser, @Body() dto: CreateFeeItemDto) {
    return this.fees.createItem(toFinanceContext(user), dto);
  }

  @Get('items')
  @Permissions('finance:fee_item:read')
  listItems(@CurrentUser() user: AuthUser, @Query() query: FeeItemQueryDto) {
    return this.fees.listItems(
      toFinanceContext(user),
      query.page,
      query.limit,
      query.feeCategoryId,
    );
  }

  @Put('items/:id')
  @Permissions('finance:fee_item:update')
  @ObjectScope({ type: 'institution', model: 'feeItem' })
  updateItem(
    @CurrentUser() user: AuthUser,
    @Param() params: FeeIdParamDto,
    @Body() dto: UpdateFeeItemDto,
  ) {
    return this.fees.updateItem(toFinanceContext(user), params.id, dto);
  }

  // ------------------------------------------------------- schedules (P6.2)
  @Post('schedules')
  @Permissions('finance:fee_schedule:create')
  createSchedule(@CurrentUser() user: AuthUser, @Body() dto: CreateFeeScheduleDto) {
    return this.fees.createSchedule(toFinanceContext(user), dto);
  }

  @Get('schedules')
  @Permissions('finance:fee_schedule:read')
  listSchedules(@CurrentUser() user: AuthUser, @Query() query: FeeScheduleQueryDto) {
    return this.fees.listSchedules(
      toFinanceContext(user),
      query.page,
      query.limit,
      query.status,
      query.academicSessionId,
    );
  }

  @Get('schedules/:id')
  @Permissions('finance:fee_schedule:read')
  @ObjectScope({ type: 'institution', model: 'feeSchedule' })
  getSchedule(@CurrentUser() user: AuthUser, @Param() params: FeeIdParamDto) {
    return this.fees.getSchedule(toFinanceContext(user), params.id);
  }

  @Put('schedules/:id')
  @Permissions('finance:fee_schedule:update')
  @ObjectScope({ type: 'institution', model: 'feeSchedule' })
  updateSchedule(
    @CurrentUser() user: AuthUser,
    @Param() params: FeeIdParamDto,
    @Body() dto: UpdateFeeScheduleDto,
  ) {
    return this.fees.updateSchedule(toFinanceContext(user), params.id, dto);
  }

  @Post('schedules/:id/publish')
  @Permissions('finance:fee_schedule:manage')
  @ObjectScope({ type: 'institution', model: 'feeSchedule' })
  publishSchedule(@CurrentUser() user: AuthUser, @Param() params: FeeIdParamDto) {
    return this.fees.publishSchedule(toFinanceContext(user), params.id);
  }

  @Post('schedules/:id/items')
  @Permissions('finance:fee_schedule:update')
  @ObjectScope({ type: 'institution', model: 'feeSchedule' })
  addScheduleItem(
    @CurrentUser() user: AuthUser,
    @Param() params: FeeIdParamDto,
    @Body() dto: AddFeeScheduleItemDto,
  ) {
    return this.fees.addScheduleItem(toFinanceContext(user), params.id, dto);
  }

  @Delete('schedules/:id/items/:itemId')
  @Permissions('finance:fee_schedule:update')
  @ObjectScope({ type: 'institution', model: 'feeSchedule' })
  removeScheduleItem(
    @CurrentUser() user: AuthUser,
    @Param() params: FeeIdParamDto & ScheduleItemParamDto,
  ) {
    return this.fees.removeScheduleItem(toFinanceContext(user), params.id, params.itemId);
  }
}
