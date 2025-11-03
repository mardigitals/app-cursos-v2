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


  findAll(): Promise<Curso[]> {
    return this.cursoRepository.find({
      relations: ['profesor', 'inscripciones'],
      order: {
        activo: 'DESC', 
        nombre: 'ASC'   
      }
    });
  }


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


  async update(id: number, updateDto: UpdateCursoDto): Promise<Curso> {
    
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
    
    const curso = await this.findOne(id);
    this.cursoRepository.merge(curso, updateDto);
    return this.cursoRepository.save(curso);
  }


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


  async reactivate(id: number): Promise<Curso> {
    const curso = await this.findOne(id);

    if (curso.profesorLegajo) { 
        const profesor = await this.profesorRepository.findOne({
            where: { legajoProfesor: curso.profesorLegajo }
        });

        
        if (!profesor || !profesor.activo) {
            throw new BadRequestException(
                `No se puede reactivar el curso. El profesor (Legajo: ${curso.profesorLegajo}) está inactivo o no existe. Asigne un nuevo profesor antes de reactivar.`
            );
        }
    }

    curso.activo = true;
    return this.cursoRepository.save(curso);
  }

async contarAlumnos(id: number): Promise<number> {
    const curso = await this.findOne(id);
    return curso.inscripciones?.length || 0;
  }


async findByProfesor(profesorLegajo: number): Promise<Curso[]> {
    return this.cursoRepository.find({
      where: { profesorLegajo, activo: true },
      relations: ['profesor', 'inscripciones'], 
    });
  }
}