import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Nota } from './entities/nota.entity';
import { CreateNotaDto } from './dto/create-nota.dto';
import { UpdateNotaDto } from './dto/update-nota.dto';

@Injectable()
export class NotasService {
  constructor(
    @InjectRepository(Nota)
    private readonly notaRepository: Repository<Nota>,
  ) {}

  // 1. Crear Nota
  async create(createDto: CreateNotaDto): Promise<Nota> {
    const nota = this.notaRepository.create(createDto);
    return this.notaRepository.save(nota);
  }

  // 2. Obtener todas las notas
  findAll(): Promise<Nota[]> {
    return this.notaRepository.find({
      relations: ['inscripcion'], // trae la inscripción de la nota
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

  // 5. Eliminar nota (borrado físico)
  async remove(id: number): Promise<void> {
    const nota = await this.findOne(id);
    await this.notaRepository.remove(nota);
  }
}
