import { IsNumber, IsString, IsOptional, Length, IsDateString } from 'class-validator';


export class CreateNotaDto {
  @IsString()
  @Length(1, 100)
  nombreEvaluacion: string;


  @IsNumber()
  calificacion: number;


  @IsOptional()
  @IsDateString()
  fechaRegistro?: string;


  @IsNumber()
  inscripcionId: number;
}


