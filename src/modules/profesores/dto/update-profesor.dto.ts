import { PartialType } from '@nestjs/mapped-types';
import { CreateProfesorDto } from './create-profesor.dto';
import { IsBoolean, IsOptional } from 'class-validator'; // Necesario para validar 'activo'

export class UpdateProfesorDto extends PartialType(CreateProfesorDto) {
  // Añadimos 'activo' para permitir que se reactive un profesor dado de baja
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}