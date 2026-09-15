import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ObjectScope } from '../../common/decorators/object-scope.decorator';
import { ObjectScopeGuard } from '../../common/guards/object-scope.guard';
import { OnboardingService } from './onboarding.service';
import {
  CreateOnboardingLinkDto,
  OnboardingClaimDto,
  OnboardingConfirmDto,
  OnboardingReviewDto,
} from './dto/onboarding.dto';

@ApiTags('onboarding')
@Controller('onboarding')
@UseGuards(AuthGuard('jwt'), PermissionGuard, ObjectScopeGuard)
export class OnboardingController {
  constructor(private readonly onboarding: OnboardingService) {}

  @Post()
  @Permissions('identity:onboarding:create')
  @ObjectScope({ type: 'tenant', model: 'onboardingLink' })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Issue a six-month onboarding link for a provisioned account' })
  create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('roles') roles: string[],
    @Body() dto: CreateOnboardingLinkDto,
  ) {
    return this.onboarding.create(tenantId, { userId, roles: roles ?? [] }, dto);
  }
}

@ApiTags('onboarding')
@Controller('onboarding')
export class PublicOnboardingController {
  constructor(private readonly onboarding: OnboardingService) {}

  @Post(':id/review')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Review an onboarding link: reveals the provisioned identity data bound to the token (does not consume it)',
  })
  review(@Param('id') id: string, @Body() dto: OnboardingReviewDto) {
    return this.onboarding.review(id, dto);
  }

  @Post(':id/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Confirm the provisioned personal information before setting a password. Echoed values must match the provisioned account exactly.',
  })
  confirm(@Param('id') id: string, @Body() dto: OnboardingConfirmDto) {
    return this.onboarding.confirm(id, dto);
  }

  @Post(':id/claim')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Claim an onboarding link after confirmation: set password, verify email, activate, and auto-authenticate',
  })
  claim(@Param('id') id: string, @Body() dto: OnboardingClaimDto) {
    return this.onboarding.claim(id, dto);
  }
}