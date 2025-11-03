import { IsString, IsEmail, IsOptional, IsDateString, Length } from 'class-validator';



export class CreateAlumnoDto {
  @IsString()
  @Length(1, 100)
  nombre: string;


  @IsString()
  @Length(1, 100)
  apellido: string;


  @IsString()
  @Length(1, 20)
  dni: string;


  @IsEmail()
  email: string;


  @IsOptional()
  @IsString()
  @Length(1, 20)
  telefono?: string;


  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;
}
