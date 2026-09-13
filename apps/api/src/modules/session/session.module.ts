import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { SessionCleanupService } from './session-cleanup.service';

/**
 * B4 / P1.4 sessions module. Requires EventEmitterModule.forRoot() at the app
 * root so SessionService can emit the in-process B4 session events (B5 owns
 * persistence). The cleanup loop is NOT auto-started here because the main web
 * app must not sweep during e2e runs; the standalone session-cleanup worker
 * process calls SessionCleanupService.startCleanupLoop() via lifecycle.
 */
@Module({
  controllers: [SessionController],
  providers: [SessionService, SessionCleanupService],
  exports: [SessionService, SessionCleanupService],
})
export class SessionModule {}