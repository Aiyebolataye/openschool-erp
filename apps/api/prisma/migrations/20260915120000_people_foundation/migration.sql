-- CreateEnum
CREATE TYPE "PersonStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('ENROLLED', 'ACTIVE', 'TRANSFERRED', 'WITHDRAWN', 'GRADUATED');

-- CreateEnum
CREATE TYPE "StaffStatus" AS ENUM ('HIRED', 'ACTIVE', 'ON_LEAVE', 'SEPARATED');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN');

-- CreateEnum
CREATE TYPE "ContactPreference" AS ENUM ('EMAIL', 'PHONE', 'SMS', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "ParentStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "GuardianStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ApplicantStatus" AS ENUM ('APPLIED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ApplicantSource" AS ENUM ('WEBSITE', 'REFERRAL', 'WALK_IN', 'AGENT', 'OTHER');

-- CreateEnum
CREATE TYPE "RelationshipType" AS ENUM ('PARENT', 'GUARDIAN', 'SIBLING', 'EMERGENCY_CONTACT', 'AUTHORIZED_PICKUP', 'STAFF_STUDENT', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "RoleContext" AS ENUM ('STUDENT', 'STAFF', 'PARENT', 'GUARDIAN', 'APPLICANT');

-- AlterEnum
ALTER TYPE "Gender" ADD VALUE 'PREFER_NOT_TO_SAY';

-- DropForeignKey
ALTER TABLE "student_guardian_relationships" DROP CONSTRAINT "student_guardian_relationships_guardianId_fkey";

-- DropForeignKey
ALTER TABLE "student_guardian_relationships" DROP CONSTRAINT "student_guardian_relationships_studentId_fkey";

-- DropIndex
DROP INDEX "guardians_tenantId_idx";

-- DropIndex
DROP INDEX "staff_tenantId_institutionId_internalEmail_key";

-- DropIndex
DROP INDEX "staff_tenantId_institutionId_staffNumber_key";

-- DropIndex
DROP INDEX "students_tenantId_institutionId_internalEmail_key";

-- DropIndex
DROP INDEX "students_tenantId_institutionId_studentNumber_key";

-- AlterTable
ALTER TABLE "guardians" DROP COLUMN "address",
DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "email",
DROP COLUMN "firstName",
DROP COLUMN "isPrimary",
DROP COLUMN "lastName",
DROP COLUMN "occupation",
DROP COLUMN "phone",
DROP COLUMN "relationship",
DROP COLUMN "updatedAt",
ADD COLUMN     "contact_preference" "ContactPreference" NOT NULL DEFAULT 'EMAIL',
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "created_by" UUID,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by" UUID,
ADD COLUMN     "institutionId" UUID NOT NULL,
ADD COLUMN     "legal_guardianship_ref" VARCHAR(500),
ADD COLUMN     "personId" UUID NOT NULL,
ADD COLUMN     "status" "GuardianStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updated_by" UUID,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "staff" DROP COLUMN "createdAt",
DROP COLUMN "dateOfBirth",
DROP COLUMN "deletedAt",
DROP COLUMN "department",
DROP COLUMN "email",
DROP COLUMN "employmentType",
DROP COLUMN "firstName",
DROP COLUMN "gender",
DROP COLUMN "hireDate",
DROP COLUMN "internalEmail",
DROP COLUMN "lastName",
DROP COLUMN "middleName",
DROP COLUMN "phone",
DROP COLUMN "position",
DROP COLUMN "profileImageUrl",
DROP COLUMN "qualification",
DROP COLUMN "specialization",
DROP COLUMN "staffNumber",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "created_by" UUID,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by" UUID,
ADD COLUMN     "employee_id" VARCHAR(50),
ADD COLUMN     "employment_type" "EmploymentType" NOT NULL DEFAULT 'FULL_TIME',
ADD COLUMN     "hire_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "internal_email" VARCHAR(255),
ADD COLUMN     "personId" UUID NOT NULL,
ADD COLUMN     "public_id" VARCHAR(20) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updated_by" UUID,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1,
DROP COLUMN "status",
ADD COLUMN     "status" "StaffStatus" NOT NULL DEFAULT 'HIRED';

-- AlterTable
ALTER TABLE "students" DROP COLUMN "address",
DROP COLUMN "admissionDate",
DROP COLUMN "bloodGroup",
DROP COLUMN "createdAt",
DROP COLUMN "dateOfBirth",
DROP COLUMN "deletedAt",
DROP COLUMN "firstName",
DROP COLUMN "gender",
DROP COLUMN "internalEmail",
DROP COLUMN "lastName",
DROP COLUMN "middleName",
DROP COLUMN "nationality",
DROP COLUMN "phone",
DROP COLUMN "profileImageUrl",
DROP COLUMN "stateOfOrigin",
DROP COLUMN "studentNumber",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "created_by" UUID,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by" UUID,
ADD COLUMN     "enrollment_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "internal_email" VARCHAR(255),
ADD COLUMN     "personId" UUID NOT NULL,
ADD COLUMN     "public_id" VARCHAR(20) NOT NULL,
ADD COLUMN     "student_id_number" VARCHAR(50),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updated_by" UUID,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1,
DROP COLUMN "status",
ADD COLUMN     "status" "StudentStatus" NOT NULL DEFAULT 'ENROLLED';

-- DropTable
DROP TABLE "student_guardian_relationships";

-- CreateTable
CREATE TABLE "people" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "public_id" VARCHAR(20) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "middle_name" VARCHAR(100),
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50),
    "date_of_birth" DATE,
    "gender" "Gender" NOT NULL,
    "blood_group" VARCHAR(10),
    "state_of_origin" VARCHAR(100),
    "address" VARCHAR(500),
    "status" "PersonStatus" NOT NULL DEFAULT 'ACTIVE',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "profile_photo_ref" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" UUID,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "people_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "person_profiles" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "personId" UUID NOT NULL,
    "bio" VARCHAR(1000),
    "customFields" JSONB,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" UUID,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "person_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "person_institutions" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "personId" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "role_context" "RoleContext" NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assigned_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" UUID,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "person_institutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_enrollment_details" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "academic_session_id" UUID,
    "grade_level" VARCHAR(50) NOT NULL,
    "class_name" VARCHAR(50),
    "stream" VARCHAR(50),
    "enrollment_type" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" UUID,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "student_enrollment_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_academic_records" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "academic_session_id" UUID,
    "record_type" VARCHAR(50) NOT NULL,
    "reference_id" UUID,
    "reference_type" VARCHAR(100),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" UUID,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "student_academic_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_graduation_details" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "graduation_date" DATE NOT NULL,
    "final_grade" VARCHAR(50),
    "certificate_number" VARCHAR(100),
    "diploma_reference" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" UUID,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "student_graduation_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_transfer_details" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "transfer_date" DATE NOT NULL,
    "source_institution_id" UUID,
    "destination_institution_id" UUID,
    "transfer_reason" VARCHAR(500),
    "transfer_documents" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" UUID,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "student_transfer_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_withdrawal_details" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "withdrawal_date" DATE NOT NULL,
    "withdrawal_reason" VARCHAR(500),
    "withdrawal_type" VARCHAR(50) NOT NULL,
    "refund_status" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" UUID,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "student_withdrawal_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_employment_details" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "staffId" UUID NOT NULL,
    "position" VARCHAR(200) NOT NULL,
    "department" VARCHAR(200),
    "reporting_to" UUID,
    "work_location" VARCHAR(200),
    "salary_grade" VARCHAR(50),
    "contract_start_date" DATE,
    "contract_end_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" UUID,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "staff_employment_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_qualifications" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "staffId" UUID NOT NULL,
    "qualification_name" VARCHAR(200) NOT NULL,
    "institution_name" VARCHAR(200) NOT NULL,
    "field_of_study" VARCHAR(200),
    "year_obtained" INTEGER NOT NULL,
    "grade" VARCHAR(50),
    "certificate_ref" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" UUID,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "staff_qualifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_certifications" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "staffId" UUID NOT NULL,
    "certification_name" VARCHAR(200) NOT NULL,
    "issuing_body" VARCHAR(200) NOT NULL,
    "issue_date" DATE NOT NULL,
    "expiry_date" DATE,
    "certificate_number" VARCHAR(100),
    "certificate_ref" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" UUID,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "staff_certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_employment_history" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "staffId" UUID NOT NULL,
    "institution_name" VARCHAR(200) NOT NULL,
    "position" VARCHAR(200) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "reason_for_leaving" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" UUID,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "staff_employment_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parents" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "personId" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "userId" UUID,
    "contact_preference" "ContactPreference" NOT NULL DEFAULT 'EMAIL',
    "status" "ParentStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" UUID,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "parents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applicants" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "personId" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "public_id" VARCHAR(20) NOT NULL,
    "application_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "target_grade" VARCHAR(100) NOT NULL,
    "source" "ApplicantSource" NOT NULL DEFAULT 'WALK_IN',
    "status" "ApplicantStatus" NOT NULL DEFAULT 'APPLIED',
    "notes" VARCHAR(2000),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" UUID,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "applicants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_contacts" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "personId" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "phone_primary" VARCHAR(50) NOT NULL,
    "phone_secondary" VARCHAR(50),
    "email" VARCHAR(255),
    "relationship" VARCHAR(100) NOT NULL,
    "priority" INTEGER NOT NULL,
    "address" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" UUID,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "emergency_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "person_relationships" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "source_person_id" UUID NOT NULL,
    "target_person_id" UUID NOT NULL,
    "relationship_type" "RelationshipType" NOT NULL,
    "institutionId" UUID NOT NULL,
    "start_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" UUID,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "person_relationships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "people_documents" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "personId" UUID NOT NULL,
    "document_type" VARCHAR(100) NOT NULL,
    "document_name" VARCHAR(200) NOT NULL,
    "file_reference" VARCHAR(500) NOT NULL,
    "file_size" INTEGER,
    "mime_type" VARCHAR(100),
    "status" "DocumentStatus" NOT NULL DEFAULT 'ACTIVE',
    "expiry_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" UUID,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "people_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "people_tenantId_status_idx" ON "people"("tenantId", "status");

-- CreateIndex
CREATE INDEX "people_tenantId_is_active_idx" ON "people"("tenantId", "is_active");

-- CreateIndex
CREATE INDEX "people_tenantId_first_name_last_name_idx" ON "people"("tenantId", "first_name", "last_name");

-- CreateIndex
CREATE UNIQUE INDEX "people_tenantId_email_key" ON "people"("tenantId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "people_tenantId_public_id_key" ON "people"("tenantId", "public_id");

-- CreateIndex
CREATE UNIQUE INDEX "person_profiles_personId_key" ON "person_profiles"("personId");

-- CreateIndex
CREATE INDEX "person_profiles_tenantId_idx" ON "person_profiles"("tenantId");

-- CreateIndex
CREATE INDEX "person_institutions_tenantId_personId_idx" ON "person_institutions"("tenantId", "personId");

-- CreateIndex
CREATE INDEX "person_institutions_tenantId_institutionId_idx" ON "person_institutions"("tenantId", "institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "person_institutions_tenantId_personId_institutionId_role_co_key" ON "person_institutions"("tenantId", "personId", "institutionId", "role_context");

-- CreateIndex
CREATE UNIQUE INDEX "student_enrollment_details_studentId_key" ON "student_enrollment_details"("studentId");

-- CreateIndex
CREATE INDEX "student_academic_records_tenantId_studentId_idx" ON "student_academic_records"("tenantId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "student_graduation_details_studentId_key" ON "student_graduation_details"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "student_transfer_details_studentId_key" ON "student_transfer_details"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "student_withdrawal_details_studentId_key" ON "student_withdrawal_details"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "staff_employment_details_staffId_key" ON "staff_employment_details"("staffId");

-- CreateIndex
CREATE INDEX "staff_qualifications_tenantId_staffId_idx" ON "staff_qualifications"("tenantId", "staffId");

-- CreateIndex
CREATE INDEX "staff_certifications_tenantId_staffId_idx" ON "staff_certifications"("tenantId", "staffId");

-- CreateIndex
CREATE INDEX "staff_employment_history_tenantId_staffId_idx" ON "staff_employment_history"("tenantId", "staffId");

-- CreateIndex
CREATE UNIQUE INDEX "parents_userId_key" ON "parents"("userId");

-- CreateIndex
CREATE INDEX "parents_tenantId_personId_idx" ON "parents"("tenantId", "personId");

-- CreateIndex
CREATE INDEX "parents_tenantId_institutionId_idx" ON "parents"("tenantId", "institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "parents_tenantId_personId_institutionId_key" ON "parents"("tenantId", "personId", "institutionId");

-- CreateIndex
CREATE INDEX "applicants_tenantId_personId_idx" ON "applicants"("tenantId", "personId");

-- CreateIndex
CREATE INDEX "applicants_tenantId_institutionId_idx" ON "applicants"("tenantId", "institutionId");

-- CreateIndex
CREATE INDEX "applicants_tenantId_status_idx" ON "applicants"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "applicants_tenantId_personId_institutionId_key" ON "applicants"("tenantId", "personId", "institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "applicants_tenantId_public_id_key" ON "applicants"("tenantId", "public_id");

-- CreateIndex
CREATE INDEX "emergency_contacts_tenantId_personId_idx" ON "emergency_contacts"("tenantId", "personId");

-- CreateIndex
CREATE UNIQUE INDEX "emergency_contacts_tenantId_personId_priority_key" ON "emergency_contacts"("tenantId", "personId", "priority");

-- CreateIndex
CREATE INDEX "person_relationships_tenantId_source_person_id_idx" ON "person_relationships"("tenantId", "source_person_id");

-- CreateIndex
CREATE INDEX "person_relationships_tenantId_target_person_id_idx" ON "person_relationships"("tenantId", "target_person_id");

-- CreateIndex
CREATE INDEX "person_relationships_tenantId_institutionId_idx" ON "person_relationships"("tenantId", "institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "person_relationships_tenantId_source_person_id_target_perso_key" ON "person_relationships"("tenantId", "source_person_id", "target_person_id", "relationship_type", "institutionId");

-- CreateIndex
CREATE INDEX "people_documents_tenantId_personId_idx" ON "people_documents"("tenantId", "personId");

-- CreateIndex
CREATE INDEX "guardians_tenantId_personId_idx" ON "guardians"("tenantId", "personId");

-- CreateIndex
CREATE INDEX "guardians_tenantId_institutionId_idx" ON "guardians"("tenantId", "institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "guardians_tenantId_personId_institutionId_key" ON "guardians"("tenantId", "personId", "institutionId");

-- CreateIndex
CREATE INDEX "staff_tenantId_personId_idx" ON "staff"("tenantId", "personId");

-- CreateIndex
CREATE INDEX "staff_tenantId_status_idx" ON "staff"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "staff_tenantId_personId_institutionId_key" ON "staff"("tenantId", "personId", "institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "staff_tenantId_public_id_key" ON "staff"("tenantId", "public_id");

-- CreateIndex
CREATE UNIQUE INDEX "staff_tenantId_institutionId_employee_id_key" ON "staff"("tenantId", "institutionId", "employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "staff_tenantId_institutionId_internal_email_key" ON "staff"("tenantId", "institutionId", "internal_email");

-- CreateIndex
CREATE INDEX "students_tenantId_personId_idx" ON "students"("tenantId", "personId");

-- CreateIndex
CREATE INDEX "students_tenantId_status_idx" ON "students"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "students_tenantId_personId_institutionId_key" ON "students"("tenantId", "personId", "institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "students_tenantId_public_id_key" ON "students"("tenantId", "public_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_tenantId_institutionId_student_id_number_key" ON "students"("tenantId", "institutionId", "student_id_number");

-- CreateIndex
CREATE UNIQUE INDEX "students_tenantId_institutionId_internal_email_key" ON "students"("tenantId", "institutionId", "internal_email");

-- AddForeignKey
ALTER TABLE "people" ADD CONSTRAINT "people_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_profiles" ADD CONSTRAINT "person_profiles_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_profiles" ADD CONSTRAINT "person_profiles_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_institutions" ADD CONSTRAINT "person_institutions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_institutions" ADD CONSTRAINT "person_institutions_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_institutions" ADD CONSTRAINT "person_institutions_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_enrollment_details" ADD CONSTRAINT "student_enrollment_details_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_enrollment_details" ADD CONSTRAINT "student_enrollment_details_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_academic_records" ADD CONSTRAINT "student_academic_records_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_academic_records" ADD CONSTRAINT "student_academic_records_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_graduation_details" ADD CONSTRAINT "student_graduation_details_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_graduation_details" ADD CONSTRAINT "student_graduation_details_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_transfer_details" ADD CONSTRAINT "student_transfer_details_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_transfer_details" ADD CONSTRAINT "student_transfer_details_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_transfer_details" ADD CONSTRAINT "student_transfer_details_source_institution_id_fkey" FOREIGN KEY ("source_institution_id") REFERENCES "institutions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_transfer_details" ADD CONSTRAINT "student_transfer_details_destination_institution_id_fkey" FOREIGN KEY ("destination_institution_id") REFERENCES "institutions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_withdrawal_details" ADD CONSTRAINT "student_withdrawal_details_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_withdrawal_details" ADD CONSTRAINT "student_withdrawal_details_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_employment_details" ADD CONSTRAINT "staff_employment_details_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_employment_details" ADD CONSTRAINT "staff_employment_details_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_employment_details" ADD CONSTRAINT "staff_employment_details_reporting_to_fkey" FOREIGN KEY ("reporting_to") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_qualifications" ADD CONSTRAINT "staff_qualifications_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_qualifications" ADD CONSTRAINT "staff_qualifications_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_certifications" ADD CONSTRAINT "staff_certifications_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_certifications" ADD CONSTRAINT "staff_certifications_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_employment_history" ADD CONSTRAINT "staff_employment_history_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_employment_history" ADD CONSTRAINT "staff_employment_history_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parents" ADD CONSTRAINT "parents_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parents" ADD CONSTRAINT "parents_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parents" ADD CONSTRAINT "parents_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parents" ADD CONSTRAINT "parents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guardians" ADD CONSTRAINT "guardians_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guardians" ADD CONSTRAINT "guardians_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guardians" ADD CONSTRAINT "guardians_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applicants" ADD CONSTRAINT "applicants_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applicants" ADD CONSTRAINT "applicants_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applicants" ADD CONSTRAINT "applicants_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_contacts" ADD CONSTRAINT "emergency_contacts_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_contacts" ADD CONSTRAINT "emergency_contacts_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_relationships" ADD CONSTRAINT "person_relationships_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_relationships" ADD CONSTRAINT "person_relationships_source_person_id_fkey" FOREIGN KEY ("source_person_id") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_relationships" ADD CONSTRAINT "person_relationships_target_person_id_fkey" FOREIGN KEY ("target_person_id") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_relationships" ADD CONSTRAINT "person_relationships_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "people_documents" ADD CONSTRAINT "people_documents_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "people_documents" ADD CONSTRAINT "people_documents_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
