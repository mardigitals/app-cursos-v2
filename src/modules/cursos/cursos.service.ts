import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Curso } from './entities/curso.entity';
import { CreateCursoDto } from './dto/create-curso.dto';
import { UpdateCursoDto } from './dto/update-curso.dto';
import { Profesor } from '../profesores/entities/profesore.entity';

@Injectable()
export class CursosService {
  constructor(
    @InjectRepository(Curso)
    private readonly cursoRepository: Repository<Curso>,
  ) {}

  // 1. Crear curso
  async create(createDto: CreateCursoDto): Promise<Curso> {
    const curso = this.cursoRepository.create(createDto);
    return this.cursoRepository.save(curso);
  }

  // 2. Obtener todos los cursos (solo activos)
  findAll(): Promise<Curso[]> {
    return this.cursoRepository.find({
      where: { activo: true },
      relations: ['profesor', 'inscripciones'],
    });
  }

  // 3. Obtener uno por ID
  async findOne(id: number): Promise<Curso> {
    const curso = await this.cursoRepository.findOne({
      where: { id, activo: true },
      relations: ['profesor', 'inscripciones'],
    });

    if (!curso) {
      throw new NotFoundException(`Curso con id ${id} no encontrado.`);
    }
    return curso;
  }

  // 4. Actualizar curso
  async update(id: number, updateDto: UpdateCursoDto): Promise<Curso> {
    const curso = await this.findOne(id);
    this.cursoRepository.merge(curso, updateDto);
    return this.cursoRepository.save(curso);
  }

  // 5. Eliminar curso (baja lógica)
  async remove(id: number): Promise<Curso> {
    const curso = await this.findOne(id);
    curso.activo = false;
    return this.cursoRepository.save(curso);
  }

  //6. Contar alumnos inscritos en un curso
  async contarAlumnos(id: number): Promise<number> {
  const curso = await this.findOne(id);
  return curso.inscripciones?.length || 0;
  }

  //7. Buscar cursos por profesor
  async findByProfesor(profesorLegajo: number): Promise<Curso[]> {
    return this.cursoRepository.find({
      where: { profesorLegajo, activo: true },
      relations: ['profesor', 'inscripciones'], // Trae datos del profesor y alumnos inscritos
    });
  }

}
