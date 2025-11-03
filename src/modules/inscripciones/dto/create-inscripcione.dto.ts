import { IsNumber, IsEnum, IsOptional } from 'class-validator';
import { EstadoInscripcion } from '../entities/inscripcione.entity';


export class CreateInscripcioneDto {
  @IsNumber()
  alumnoLegajo: number;


  @IsNumber()
  cursoId: number;


  @IsOptional()
  @IsEnum(EstadoInscripcion)
  estado?: EstadoInscripcion;
}
