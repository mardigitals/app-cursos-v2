import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Alumno } from '../alumnos/entities/alumno.entity';
import { Profesor } from '../profesores/entities/profesore.entity';
import { Curso } from '../cursos/entities/curso.entity';
import { Inscripcion } from '../inscripciones/entities/inscripcione.entity';

@Module({
  imports: [
    // Importamos todas las entidades que necesitamos leer
    TypeOrmModule.forFeature([
      Alumno, 
      Profesor, 
      Curso, 
      Inscripcion
    ])
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}