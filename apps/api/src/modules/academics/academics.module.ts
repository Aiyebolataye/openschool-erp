import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { CalendarService } from './services/calendar.service';
import { CurriculumService } from './services/curriculum.service';
import { TeachingService } from './services/teaching.service';
import { TimetableService } from './services/timetable.service';
import { EnrollmentService } from './services/enrollment.service';
import { AttendanceService } from './services/attendance.service';
import { AssignmentService } from './services/assignment.service';
import { AssessmentService } from './services/assessment.service';
import { GradingService } from './services/grading.service';
import { ResultsService } from './services/results.service';
import { ProgressionService } from './services/progression.service';
import { PolicyService } from './services/policy.service';
import { SummerSchoolService } from './services/summer-school.service';
import { CalendarController } from './controllers/calendar.controller';
import { CurriculumController } from './controllers/curriculum.controller';
import { TeachingController } from './controllers/teaching.controller';
import { EnrollmentController } from './controllers/enrollment.controller';
import { WorkController } from './controllers/work.controller';
import { GradingController } from './controllers/grading.controller';
import { AdministrationController } from './controllers/administration.controller';
import { SummerSchoolController } from './controllers/summer-school.controller';

/**
 * P5 — Academic Management module (P5.1–P5.8): calendar, curriculum,
 * teaching/timetable, enrollment, attendance, assignments, assessments,
 * grading, results/report cards, progression, policies and summer school.
 * AuthZ: AuthGuard('jwt') + PermissionGuard (academics:* catalogue, D-2) +
 * ObjectScopeGuard (institution-scoped, fail-closed). Mutations emit D-4
 * envelope-aware events with a shared eventId on the audit row (72h dedup).
 */
@Module({
  imports: [AuditModule],
  controllers: [
    CalendarController,
    CurriculumController,
    TeachingController,
    EnrollmentController,
    WorkController,
    GradingController,
    AdministrationController,
    SummerSchoolController,
  ],
  providers: [
    CalendarService,
    CurriculumService,
    TeachingService,
    TimetableService,
    EnrollmentService,
    AttendanceService,
    AssignmentService,
    AssessmentService,
    GradingService,
    ResultsService,
    ProgressionService,
    PolicyService,
    SummerSchoolService,
  ],
  exports: [CalendarService, GradingService],
})
export class AcademicsModule {}