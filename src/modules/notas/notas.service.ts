import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Nota } from './entities/nota.entity';
import { CreateNotaDto } from './dto/create-nota.dto';
import { UpdateNotaDto } from './dto/update-nota.dto';
import { Inscripcion, EstadoInscripcion } from '../inscripciones/entities/inscripcione.entity';

@Injectable()
export class NotasService {
  constructor(
    @InjectRepository(Nota)
    private readonly notaRepository: Repository<Nota>,
   //Necesario para validar 
    @InjectRepository(Inscripcion)
    private readonly inscripcionRepository: Repository<Inscripcion>,
  ) {}

  async create(createDto: CreateNotaDto): Promise<Nota> {
    

    const { inscripcionId } = createDto;

    // 1. Buscamos la inscripción padre
    const inscripcion = await this.inscripcionRepository.findOne({
        where: { id: inscripcionId }
    });

    // 2. Validamos que la inscripción exista
    if (!inscripcion) {
        throw new NotFoundException(`La inscripción con ID ${inscripcionId} no existe.`);
    }

    // 3. Verificamos el estado de la inscripción
    if (inscripcion.estado === EstadoInscripcion.RETIRADO || 
        inscripcion.estado === EstadoInscripcion.COMPLETADO) {
        
        throw new BadRequestException( // Error 400
            `No se puede cargar una nota. La inscripción (ID: ${inscripcionId}) ya está en estado "${inscripcion.estado}".`
        );
    }
    
    const nota = this.notaRepository.create(createDto);
    return this.notaRepository.save(nota);
  }

  // 2. Obtener todas las notas 
  findAll(): Promise<Nota[]> {
    return this.notaRepository.find({
      relations: ['inscripcion'], 
    });
  }

  // 3. Obtener una nota por ID 
  async findOne(id: number): Promise<Nota> {
    const nota = await this.notaRepository.findOne({
      where: { id },
      relations: ['inscripcion'],
    });
    if (!nota) {
      throw new NotFoundException(`Nota con id ${id} no encontrada.`);
    }
    return nota;
  }

  // 4. Actualizar nota 
  async update(id: number, updateDto: UpdateNotaDto): Promise<Nota> {
    const nota = await this.findOne(id);
    this.notaRepository.merge(nota, updateDto);
    return this.notaRepository.save(nota);
  }

  // 5. Eliminar nota 
  async remove(id: number): Promise<void> {
    const nota = await this.findOne(id);
    await this.notaRepository.remove(nota);
  }
}