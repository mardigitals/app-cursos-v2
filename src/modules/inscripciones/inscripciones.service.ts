import { ConflictException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common'; // <-- 1. Añadido BadRequestException
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

  // --- 2. MÉTODO 'create' ACTUALIZADO CON VALIDACIÓN ---
  async create(createDto: CreateInscripcioneDto): Promise<Inscripcion> {
    
    // 1. Validar Alumno
    const alumno = await this.alumnosService.findOne(createDto.alumnoLegajo);
    // (findOne ya NO filtra por activo, lo validamos manualmente)
    if (!alumno.activo) {
      throw new BadRequestException(
        `El alumno ${alumno.nombre} ${alumno.apellido} (Legajo: ${alumno.legajoAlumno}) está inactivo y no puede ser inscrito.`
      );
    }
    
    // 2. Validar Curso
    const curso = await this.cursosService.findOne(createDto.cursoId);
    // (findOne ya NO filtra por activo, lo validamos manualmente)
    if (!curso.activo) {
      throw new BadRequestException(
        `El curso "${curso.nombre}" (ID: ${curso.id}) está inactivo y no acepta nuevas inscripciones.`
      );
    }
    
    // 3. Validar Duplicado (Sin cambios)
    const inscripcionExistente = await this.inscripcionRepository.findOne({
      where: { 
          alumnoLegajo: alumno.legajoAlumno, 
          cursoId: curso.id             
      }
    });

    if (inscripcionExistente) {
      throw new ConflictException('El alumno ya está inscrito en este curso.');
    }

    // 4. Crear la entidad si todo está bien (Sin cambios)
    const inscripcion = this.inscripcionRepository.create({
      ...createDto, 
      alumno: alumno, 
      curso: curso, 
      // El estado por defecto ('INSCRITO') se toma de la entidad
    });
    
    return this.inscripcionRepository.save(inscripcion);
  }

  // --- 3. MÉTODO 'findAll' ACTUALIZADO CON ORDEN ---
  findAll(): Promise<Inscripcion[]> {
    return this.inscripcionRepository.find({
      relations: ['alumno', 'curso', 'notas'],
      // --- LÓGICA DE ORDEN AÑADIDA ---
      order: {
        estado: 'ASC', // Ordena alfabéticamente (ACTIVO, COMPLETADO, INSCRITO, RETIRADO)
        id: 'DESC'     // Como segundo criterio, las más nuevas primero
      }
    });
  }

  // 3. Obtener una inscripción por id (Sin cambios)
  async findOne(id: number): Promise<Inscripcion> {
    const inscripcion = await this.inscripcionRepository.findOne({
      where: { id },
      relations: ['alumno', 'curso', 'notas'],
    });

    if (!inscripcion) {
      throw new NotFoundException(`Inscripción con id ${id} no encontrada.`);
    }
    return inscripcion;
  }

  // 4. Actualizar inscripción (Sin cambios)
  async update(id: number, updateDto: UpdateInscripcioneDto): Promise<Inscripcion> {
    const inscripcion = await this.findOne(id);
    // (Aquí podríamos añadir validaciones, p.ej. no permitir cambiar estado si el alumno está inactivo)
    this.inscripcionRepository.merge(inscripcion, updateDto);
    return this.inscripcionRepository.save(inscripcion);
  }

  // --- 5. MÉTODO 'remove' CORREGIDO (BAJA LÓGICA) ---
  // (En lugar de un borrado físico, cambiamos el estado a RETIRADO)
  async remove(id: number): Promise<Inscripcion> { 
    // 1. Busca la inscripción
    const inscripcion = await this.findOne(id);

    // 2. Ejecuta la BAJA LÓGICA
    inscripcion.estado = EstadoInscripcion.RETIRADO; 

    // 3. Guarda y retorna la entidad actualizada
    return this.inscripcionRepository.save(inscripcion);
  }
}