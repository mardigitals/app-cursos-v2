// En: src/dashboard/dashboard.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alumno } from '../alumnos/entities/alumno.entity';
import { Curso } from '../cursos/entities/curso.entity';
import { Inscripcion, EstadoInscripcion } from '../inscripciones/entities/inscripcione.entity';
import { Profesor } from '../profesores/entities/profesore.entity';

// Estructura de la respuesta
export interface DashboardStats {
  kpis: {
    totalAlumnosActivos: number;
    totalCursosActivos: number;
    totalProfesoresActivos: number;
    inscripcionesActivas: number;
  };
  graficos: {
    inscripcionesPorEstado: Array<{ name: string, value: number }>;
    alumnosPorCurso: Array<{ name: string, value: number }>;
  };
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Alumno)
    private readonly alumnoRepository: Repository<Alumno>,
    @InjectRepository(Curso)
    private readonly cursoRepository: Repository<Curso>,
    @InjectRepository(Inscripcion)
    private readonly inscripcionRepository: Repository<Inscripcion>,
    @InjectRepository(Profesor)
    private readonly profesorRepository: Repository<Profesor>,
  ) {}

  async getStats(): Promise<DashboardStats> {
    
    // --- 1. KPIs (Sin cambios) ---
    const totalAlumnosActivos = await this.alumnoRepository.count({ where: { activo: true } });
    const totalCursosActivos = await this.cursoRepository.count({ where: { activo: true } });
    const totalProfesoresActivos = await this.profesorRepository.count({ where: { activo: true } });
    const inscripcionesActivas = await this.inscripcionRepository.count({ 
        where: { estado: EstadoInscripcion.ACTIVO } 
    });

    // --- 2. Gráfico de Pie (Inscripciones por Estado) ---
    const inscripcionesRaw = await this.inscripcionRepository.createQueryBuilder("insc")
      .select("insc.estado", "name")
      .addSelect("COUNT(insc.id)", "value")
      .groupBy("insc.estado")
      .getRawMany();

    // --- ¡CORRECCIÓN! Convertimos el 'value' (string) a 'value' (number) ---
    const inscripcionesPorEstado = inscripcionesRaw.map(item => ({
        name: item.name,
        value: parseInt(item.value, 10) || 0 // Parsea a número
    }));

    // --- 3. Gráfico de Barras (Alumnos por Curso) ---
    const cursosRaw = await this.cursoRepository.createQueryBuilder("curso")
      .select("curso.nombre", "name")
      .addSelect("COUNT(insc.id)", "value")
      .leftJoin("curso.inscripciones", "insc", 
          "insc.estado IN (:...estados)", 
          { estados: [EstadoInscripcion.ACTIVO, EstadoInscripcion.INSCRITO] }
      )
      .where("curso.activo = :activo", { activo: true })
      .groupBy("curso.id")
      .orderBy("value", "DESC") 
      .limit(10)
      .getRawMany();
    
    // --- ¡CORRECCIÓN! Convertimos el 'value' (string) a 'value' (number) ---
    const alumnosPorCurso = cursosRaw.map(item => ({
        name: item.name,
        value: parseInt(item.value, 10) || 0 // Parsea a número
    })).filter(c => c.value > 0); // Filtramos los que tienen 0 alumnos

    // --- 4. Retorno de datos ---
    return {
      kpis: {
        totalAlumnosActivos,
        totalCursosActivos,
        totalProfesoresActivos,
        inscripcionesActivas,
      },
      graficos: {
        inscripcionesPorEstado,
        alumnosPorCurso,
      }
    };
  }
}