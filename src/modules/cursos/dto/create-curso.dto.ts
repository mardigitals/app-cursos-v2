import { IsString, IsOptional, IsNumber, Length, Min } from 'class-validator';


export class CreateCursoDto {
  @IsString()
  @Length(1, 100)
  nombre: string;


  @IsString()
  descripcion: string;


  @IsOptional()
  @IsNumber()
  @Min(1)
  duracion?: number;


  @IsOptional()
  @IsNumber()
  profesorLegajo?: number; // FK al profesor
}

