import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
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
    private readonly alumnosService: AlumnosService, // <-- Debe estar inyectado
    private readonly cursosService: CursosService,   // <-- Debe estar inyectado
) {}

  

  // 1. Crear inscripción
async create(createDto: CreateInscripcioneDto): Promise<Inscripcion> {
    
    // 1. Validar Alumno
    const alumno = await this.alumnosService.findOne(createDto.alumnoLegajo);
    // (findOne lanza NotFoundException si no existe o está inactivo)
    
    // 2. Validar Curso
    const curso = await this.cursosService.findOne(createDto.cursoId);
    // (findOne lanza NotFoundException si no existe o está inactivo)
    
    // 3. Validar Duplicado
    const inscripcionExistente = await this.inscripcionRepository.findOne({
      where: { 
          alumnoLegajo: alumno.legajoAlumno, // Usa la PK del alumno
          cursoId: curso.id                // Usa la PK del curso
      }
    });

    if (inscripcionExistente) {
      throw new ConflictException('El alumno ya está inscrito en este curso.');
    }

    // 4. Crear la entidad si todo está bien
    const inscripcion = this.inscripcionRepository.create({
      ...createDto, // Usa los datos del DTO (alumnoLegajo, cursoId)
      alumno: alumno, // Asigna la entidad Alumno completa
      curso: curso,   // Asigna la entidad Curso completa
      // El 'estado' tomará el valor por defecto ('ACTIVO') definido en la entidad
    });
    
    return this.inscripcionRepository.save(inscripcion);
}

  // 2. Obtener todas las inscripciones
  findAll(): Promise<Inscripcion[]> {
    return this.inscripcionRepository.find({
      relations: ['alumno', 'curso', 'notas'],
    });
  }

  // 3. Obtener una inscripción por id
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

  // 4. Actualizar inscripción
  async update(id: number, updateDto: UpdateInscripcioneDto): Promise<Inscripcion> {
    const inscripcion = await this.findOne(id);
    this.inscripcionRepository.merge(inscripcion, updateDto);
    return this.inscripcionRepository.save(inscripcion);
  }

  // 5. Eliminar inscripción (baja lógica)
  // En src/modules/inscripciones/inscripciones.service.ts

// 👇 REEMPLAZA TU MÉTODO remove CON ESTE 👇
async remove(id: number): Promise<void> { // Cambia el tipo de retorno a Promise<void>
    // 1. (Opcional) Verifica si existe antes de borrar
    const inscripcion = await this.findOne(id); // findOne ya lanza 404

    // 2. Ejecuta el BORRADO FÍSICO
    const result = await this.inscripcionRepository.delete(id); 

    // 3. (Opcional) Verifica si se borró algo
    if (result.affected === 0) {
        throw new NotFoundException(`Inscripción con id ${id} no encontrada para eliminar.`);
    }
    // No retorna nada
}
}
