import { IsUUID } from 'class-validator';

export class InstitutionIdParamDto {
  @IsUUID()
  id: string;
}
