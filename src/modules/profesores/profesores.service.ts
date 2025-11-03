import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm'; // <-- 1. DataSource importado
import { Profesor } from './entities/profesore.entity';
import { CreateProfesorDto } from './dto/create-profesor.dto';
import { UpdateProfesorDto } from './dto/update-profesor.dto';
import { Curso } from '../cursos/entities/curso.entity'; // <-- 2. Curso importado

@Injectable()
export class ProfesoresService {
  constructor(
    @InjectRepository(Profesor)
    private readonly profesorRepository: Repository<Profesor>,
    
    // --- 3. INYECCIÓN AÑADIDA ---
    // (Necesaria para poder ejecutar la transacción)
    private dataSource: DataSource,
  ) {}

  // 1. Crear Profesor (Sin cambios)
  async create(createDto: CreateProfesorDto): Promise<Profesor> {
    const nuevoProfesor = this.profesorRepository.create(createDto);
    return this.profesorRepository.save(nuevoProfesor);
  }

  // 2. Obtener todos los Profesores (Sin cambios)
  findAll(): Promise<Profesor[]> {
    return this.profesorRepository.find({
      relations: ['cursos'],
        order: {
        activo: 'DESC', 
        legajoProfesor: 'ASC'   
      }
    });
  }

  // 3. Obtener uno por Legajo (Sin cambios)
  async findOne(legajoProfesor: number): Promise<Profesor> {
    const profesor = await this.profesorRepository.findOne({
      where: { legajoProfesor },
      relations: ['cursos'],
    });

    if (!profesor) {
      throw new NotFoundException(`Profesor con legajo ${legajoProfesor} no encontrado.`);
    }
    return profesor;
  }

  // 4. Actualizar Profesor (Sin cambios)
  async update(legajoProfesor: number, updateDto: UpdateProfesorDto): Promise<Profesor> {
    const profesor = await this.findOne(legajoProfesor); 
    this.profesorRepository.merge(profesor, updateDto);
    return this.profesorRepository.save(profesor);
  }

  // --- 5. MÉTODO 'remove' ACTUALIZADO CON TRANSACCIÓN Y CASCADA ---
  async remove(legajoProfesor: number): Promise<Profesor> {
    
    // this.dataSource.transaction maneja automáticamente el 'commit' y 'rollback'
    return this.dataSource.transaction(async (transactionalEntityManager) => {
        
        // 1. Buscamos al profesor DENTRO de la transacción
        const profesor = await transactionalEntityManager.findOne(Profesor, {
            where: { legajoProfesor },
        });

        if (!profesor) {
            throw new NotFoundException(`Profesor con legajo ${legajoProfesor} no encontrado.`);
        }

        // 2. LÓGICA DE CASCADA: Actualizamos los cursos
        // Ponemos 'profesorLegajo = null' en todos los cursos que dicta este profesor
        await transactionalEntityManager.update(
            Curso, // Entidad a actualizar
            { profesorLegajo: legajoProfesor }, // Cláusula 'where'
            { profesorLegajo: null }, // Cláusula 'set'
        );

        // 3. Ejecutamos la baja lógica del profesor
        profesor.activo = false; 
        
        // 4. Guardamos al profesor DENTRO de la transacción
        return transactionalEntityManager.save(profesor);
    });
  }

  // 6. Reactivar (Sin cambios)
  async reactivate(legajoProfesor: number): Promise<Profesor> {
    const profesor = await this.findOne(legajoProfesor);
    profesor.activo = true;
    return this.profesorRepository.save(profesor);
  }
}