import { IsString, IsNotEmpty, IsEmail, IsOptional, IsDateString, Length } from 'class-validator';

export class CreateProfesorDto {
  @IsString()
  @IsNotEmpty() // Asegura que no sea solo una cadena vacía
  @Length(1, 100) // Restricción de longitud de tu versión
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  apellido: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 20) // Longitud apropiada para un DNI
  dni: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  telefono?: string;

  @IsString() // Se recibe como string (ej: "1990-01-01")
  @IsDateString() // Valida que el string tenga formato de fecha
  fechaNacimiento: string; // Lo mantenemos requerido, ya que es un dato administrativo esencial

  @IsOptional()
  @IsString()
  especialidades?: string;
}