import { ConflictException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inscripcion, EstadoInscripcion } from './entities/inscripcione.entity';
import { CreateInscripcioneDto } from './dto/create-inscripcione.dto';
import { UpdateInscripcioneDto } from './dto/update-inscripcione.dto';
import { AlumnosService } from '../alumnos/alumnos.service';
import { CursosService } from '../cursos/cursos.service';

@Injectable()
export class InscripcionesService {
  constructor(
    @InjectRepository(Inscripcion)
    private readonly inscripcionRepository: Repository<Inscripcion>,
    private readonly alumnosService: AlumnosService, 
    private readonly cursosService: CursosService,   
) {}

  // --- 1. MÉTODO 'create'
  async create(createDto: CreateInscripcioneDto): Promise<Inscripcion> {
    
    // 1. Validar Alumno
    const alumno = await this.alumnosService.findOne(createDto.alumnoLegajo);
    if (!alumno.activo) {
      throw new BadRequestException(
        `El alumno ${alumno.nombre} ${alumno.apellido} (Legajo: ${alumno.legajoAlumno}) está inactivo y no puede ser inscrito.`
      );
    }
    
    // 2. Validar Curso
    const curso = await this.cursosService.findOne(createDto.cursoId);
    if (!curso.activo) {
      throw new BadRequestException(
        `El curso "${curso.nombre}" (ID: ${curso.id}) está inactivo y no acepta nuevas inscripciones.`
      );
    }
    
    // 3. Validar Duplicado 
    const inscripcionExistente = await this.inscripcionRepository.findOne({
      where: { 
          alumnoLegajo: alumno.legajoAlumno, 
          cursoId: curso.id             
      }
    });

    if (inscripcionExistente) {
      throw new ConflictException('El alumno ya está inscrito en este curso.');
    }

    // 4. Crear entidad
    const inscripcion = this.inscripcionRepository.create({
      ...createDto, 
      alumno: alumno, 
      curso: curso, 
    });
    
    return this.inscripcionRepository.save(inscripcion);
  }


  findAll(): Promise<Inscripcion[]> {
    return this.inscripcionRepository.find({
      relations: ['alumno', 'curso', 'notas'],
      order: {
        estado: 'ASC', 
        id: 'DESC'     
      }
    });
  }


  async findOne(id: number): Promise<Inscripcion> {
    const inscripcion = await this.inscripcionRepository.findOne({
      where: { id },
      relations: ['alumno', 'curso', 'notas'], // <-- Carga Alumno y Curso
    });

    if (!inscripcion) {
      throw new NotFoundException(`Inscripción con id ${id} no encontrada.`);
    }
    return inscripcion;
  }

  
  async update(id: number, updateDto: UpdateInscripcioneDto): Promise<Inscripcion> {
    
    // 1. Buscamos la inscripción con todas sus relaciones (usamos el 'findOne' que ya es robusto)
    const inscripcionAValidar = await this.findOne(id); 

    // Solo validamos si se intenta cambiar el estado
    if (updateDto.estado) { 
      
        // VALIDACIÓN: Alumno Inactivo
        if (!inscripcionAValidar.alumno.activo) { 
          throw new BadRequestException(
            `Operación rechazada: El alumno ${inscripcionAValidar.alumno.nombre} ${inscripcionAValidar.alumno.apellido} está inactivo y su inscripción no puede ser modificada.`
          );
        }

        // VALIDACIÓN: Curso Inactivo (¡EL PUNTO CLAVE!)
        if (!inscripcionAValidar.curso.activo) { 
            throw new BadRequestException(
                `Operación rechazada: El curso "${inscripcionAValidar.curso.nombre}" está inactivo y su inscripción no puede ser modificada.`
            );
        }
    }

    this.inscripcionRepository.merge(inscripcionAValidar, updateDto);
    return this.inscripcionRepository.save(inscripcionAValidar);
  }


  async remove(id: number): Promise<Inscripcion> { 

    const inscripcion = await this.findOne(id);


    inscripcion.estado = EstadoInscripcion.RETIRADO; 

    return this.inscripcionRepository.save(inscripcion);
  }
}