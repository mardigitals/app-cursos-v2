import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InscripcionesService } from './inscripciones.service';
import { InscripcionesController } from './inscripciones.controller';
import { Inscripcion } from './entities/inscripcione.entity';

// 👇 IMPORTACIONES CLAVE QUE FALTABAN 👇
import { AlumnosModule } from '../alumnos/alumnos.module';
import { CursosModule } from '../cursos/cursos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Inscripcion]),
    // 👇 AÑADIR ESTOS MÓDULOS AQUÍ 👇
    AlumnosModule, // Ahora NestJS sabe dónde encontrar AlumnosService
    CursosModule,  // Ahora NestJS sabe dónde encontrar CursosService
  ],
  controllers: [InscripcionesController],
  providers: [InscripcionesService],
  exports: [InscripcionesService],
})
export class InscripcionesModule {}
