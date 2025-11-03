import { IsString, IsNotEmpty, IsEmail, IsOptional, IsDateString, Length } from 'class-validator';

export class CreateProfesorDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100) 
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  apellido: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 20) 
  dni: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  telefono?: string;

  @IsString() 
  @IsDateString() 
  fechaNacimiento: string; 

  @IsOptional()
  @IsString()
  especialidades?: string;
}