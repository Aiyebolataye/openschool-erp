import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PermissionGuard } from '../../../common/guards/permission.guard';
import { ObjectScopeGuard } from '../../../common/guards/object-scope.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { ObjectScope } from '../../../common/decorators/object-scope.decorator';
import { CurrentUser } from '../../../common/decorators/user.decorator';
import { FinancialPolicyService } from '../services/policy.service';
import { AuthUser, toFinanceContext } from '../finance.types';
import { FeeIdParamDto } from '../dto/fee.dto';
import {
  CreateFinancialPolicyDto,
  FinancialPolicyQueryDto,
  PolicyHistoryQueryDto,
  UpdateFinancialPolicyDto,
} from '../dto/policy.dto';

/**
 * P6.2 — Financial policy endpoints (frozen Finance §9.4
 * FinancialPolicyController, §10.3 Financial Policies).
 *
 * `GET /policies/history` is declared before `GET /policies/:id` so the literal
 * segment wins the match; Nest resolves routes in declaration order.
 */
@ApiTags('finance/policies')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard, ObjectScopeGuard)
@Controller('finance/policies')
export class FinancialPolicyController {
  constructor(private readonly policies: FinancialPolicyService) {}

  @Get()
  @Permissions('finance:policy:read')
  listPolicies(@CurrentUser() user: AuthUser, @Query() query: FinancialPolicyQueryDto) {
    return this.policies.listPolicies(toFinanceContext(user), query);
  }

  @Get('history')
  @Permissions('finance:policy:read')
  listHistory(@CurrentUser() user: AuthUser, @Query() query: PolicyHistoryQueryDto) {
    return this.policies.listHistory(toFinanceContext(user), query);
  }

  @Get(':id')
  @Permissions('finance:policy:read')
  @ObjectScope({ type: 'institution', model: 'financialPolicy' })
  getPolicy(@CurrentUser() user: AuthUser, @Param() params: FeeIdParamDto) {
    return this.policies.getPolicy(toFinanceContext(user), params.id);
  }

  @Post()
  @Permissions('finance:policy:create')
  createPolicy(@CurrentUser() user: AuthUser, @Body() dto: CreateFinancialPolicyDto) {
    return this.policies.createPolicy(toFinanceContext(user), dto);
  }

  @Put(':id')
  @Permissions('finance:policy:update')
  @ObjectScope({ type: 'institution', model: 'financialPolicy' })
  updatePolicy(
    @CurrentUser() user: AuthUser,
    @Param() params: FeeIdParamDto,
    @Body() dto: UpdateFinancialPolicyDto,
  ) {
    return this.policies.updatePolicy(toFinanceContext(user), params.id, dto);
  }
}
