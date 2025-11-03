import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Curso } from './entities/curso.entity';
import { CreateCursoDto } from './dto/create-curso.dto';
import { UpdateCursoDto } from './dto/update-curso.dto';
import { Profesor } from '../profesores/entities/profesore.entity';
import { Inscripcion, EstadoInscripcion } from '../inscripciones/entities/inscripcione.entity';

@Injectable()
export class CursosService {
  constructor(
    @InjectRepository(Curso)
    private readonly cursoRepository: Repository<Curso>,
    
    @InjectRepository(Profesor)
    private readonly profesorRepository: Repository<Profesor>,

    private dataSource: DataSource,
  ) {}

  // 1. Crear curso (Validado, sin cambios)
  async create(createDto: CreateCursoDto): Promise<Curso> {
    const { profesorLegajo } = createDto;
    const profesor = await this.profesorRepository.findOne({
      where: { legajoProfesor: profesorLegajo }
    });
    if (!profesor) {
      throw new NotFoundException(`El profesor con legajo ${profesorLegajo} no existe.`);
    }
    if (!profesor.activo) {
      throw new BadRequestException( 
        `El profesor ${profesor.nombre} ${profesor.apellido} está inactivo y no puede ser asignado a un nuevo curso.`
      );
    }
    const curso = this.cursoRepository.create(createDto);
    return this.cursoRepository.save(curso);
  }

  // 2. Obtener todos los cursos (Ordenado, sin cambios)
  findAll(): Promise<Curso[]> {
    return this.cursoRepository.find({
      relations: ['profesor', 'inscripciones'],
      order: {
        activo: 'DESC', 
        nombre: 'ASC'   
      }
    });
  }

  // 3. Obtener uno por ID (Corregido, sin cambios)
  async findOne(id: number): Promise<Curso> {
    const curso = await this.cursoRepository.findOne({
      where: { id: id }, 
      relations: ['profesor', 'inscripciones'],
    });
    if (!curso) {
      throw new NotFoundException(`Curso con id ${id} no encontrado.`);
    }
    return curso;
  }

  // --- 4. MÉTODO 'update' ACTUALIZADO CON VALIDACIÓN ---
  async update(id: number, updateDto: UpdateCursoDto): Promise<Curso> {
    
    // --- INICIO DE LÓGICA DE VALIDACIÓN ---
    // Verificamos si el DTO incluye un *cambio* de profesor
    if (updateDto.profesorLegajo) {
        const profesor = await this.profesorRepository.findOne({
            where: { legajoProfesor: updateDto.profesorLegajo }
        });

        if (!profesor) {
            throw new NotFoundException(`El profesor con legajo ${updateDto.profesorLegajo} no existe.`);
        }

        if (!profesor.activo) {
            throw new BadRequestException( 
                `El profesor ${profesor.nombre} ${profesor.apellido} está inactivo y no puede ser asignado.`
            );
        }
    }
    // --- FIN DE LÓGICA DE VALIDACIÓN ---

    // Si pasa la validación (o no se cambió el profesor), continuamos.
    const curso = await this.findOne(id);
    this.cursoRepository.merge(curso, updateDto);
    return this.cursoRepository.save(curso);
  }

  // 5. MÉTODO 'remove' (Con transacción, sin cambios)
  async remove(id: number): Promise<Curso> {
    return this.dataSource.transaction(async (transactionalEntityManager) => {
        const curso = await transactionalEntityManager.findOne(Curso, {
            where: { id },
        });
        if (!curso) {
            throw new NotFoundException(`Curso con id ${id} no encontrado.`);
        }
        await transactionalEntityManager.update(
            Inscripcion, 
            { 
                cursoId: id,
                estado: In([ EstadoInscripcion.ACTIVO, EstadoInscripcion.INSCRITO ])
            }, 
            { 
                estado: EstadoInscripcion.RETIRADO 
            },
        );
        curso.activo = false; 
        return transactionalEntityManager.save(curso);
    });
  }

  // --- 6. MÉTODO 'reactivate' ACTUALIZADO CON VALIDACIÓN ---
  async reactivate(id: number): Promise<Curso> {
    const curso = await this.findOne(id);

    // --- INICIO DE LÓGICA DE VALIDACIÓN ---
    // Verificamos si el profesor asignado sigue siendo válido
    if (curso.profesorLegajo) { // Si tiene un profesor asignado
        const profesor = await this.profesorRepository.findOne({
            where: { legajoProfesor: curso.profesorLegajo }
        });

        // Si el profesor está inactivo o no existe, no podemos reactivar el curso.
        if (!profesor || !profesor.activo) {
            throw new BadRequestException(
                `No se puede reactivar el curso. El profesor (Legajo: ${curso.profesorLegajo}) está inactivo o no existe. Asigne un nuevo profesor antes de reactivar.`
            );
        }
    }
    // --- FIN DE LÓGICA DE VALIDACIÓN ---

    curso.activo = true;
    return this.cursoRepository.save(curso);
  }

  // 7. Contar alumnos (Sin cambios)
  async contarAlumnos(id: number): Promise<number> {
    const curso = await this.findOne(id);
    return curso.inscripciones?.length || 0;
  }

  // 8. Buscar cursos por profesor (Sin cambios)
  async findByProfesor(profesorLegajo: number): Promise<Curso[]> {
    return this.cursoRepository.find({
      where: { profesorLegajo, activo: true },
      relations: ['profesor', 'inscripciones'], 
    });
  }
}