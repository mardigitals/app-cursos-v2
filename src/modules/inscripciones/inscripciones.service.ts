import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inscripcion, EstadoInscripcion } from './entities/inscripcione.entity';
import { CreateInscripcioneDto } from './dto/create-inscripcione.dto';
import { UpdateInscripcioneDto } from './dto/update-inscripcione.dto';

@Injectable()
export class InscripcionesService {
  constructor(
    @InjectRepository(Inscripcion)
    private readonly inscripcionRepository: Repository<Inscripcion>,
  ) {}

  // 1. Crear inscripción
  async create(createDto: CreateInscripcioneDto): Promise<Inscripcion> {
    const inscripcion = this.inscripcionRepository.create(createDto);
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
  async remove(id: number): Promise<Inscripcion> {
    const inscripcion = await this.findOne(id);
    inscripcion.estado = EstadoInscripcion.RETIRADO;
    return this.inscripcionRepository.save(inscripcion);
  }

}
