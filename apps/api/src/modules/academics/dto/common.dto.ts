import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AcademicIdParamDto {
  @IsUUID()
  id: string;
}

export class AcademicParentParamDto {
  @IsUUID()
  parentId: string;

  @IsUUID()
  id: string;
}

export class AcademicQueryDto {
  @ApiProperty({ required: false, default: 1, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({ required: false, default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}