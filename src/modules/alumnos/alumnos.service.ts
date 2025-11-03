import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm'; 
import { Alumno } from './entities/alumno.entity';
import { CreateAlumnoDto } from './dto/create-alumno.dto';
import { UpdateAlumnoDto } from './dto/update-alumno.dto';
import { Inscripcion, EstadoInscripcion } from '../inscripciones/entities/inscripcione.entity'; 

@Injectable()
export class AlumnosService {
  constructor(
    @InjectRepository(Alumno)
    private readonly alumnoRepository: Repository<Alumno>,


    // (Intección necesaria para poder ejecutar la transacción)
    private dataSource: DataSource,
  ) {}


  async create(createDto: CreateAlumnoDto): Promise<Alumno> {
    const alumno = this.alumnoRepository.create(createDto);
    return this.alumnoRepository.save(alumno);
  }


  findAll(): Promise<Alumno[]> {
    return this.alumnoRepository.find({
      relations: ['inscripciones'],
      
      order: {
        activo: 'DESC',   
        apellido: 'ASC' 
      }
    });
  }


  async findOne(legajoAlumno: number): Promise<Alumno> {
    const alumno = await this.alumnoRepository.findOne({
      where: { legajoAlumno: legajoAlumno }, 
      relations: ['inscripciones'],
    });

    if (!alumno) {
      throw new NotFoundException(`Alumno con legajo ${legajoAlumno} no encontrado.`);
    }
    return alumno;
  }


  async update(legajoAlumno: number, updateDto: UpdateAlumnoDto): Promise<Alumno> {
    const alumno = await this.findOne(legajoAlumno); 
    this.alumnoRepository.merge(alumno, updateDto);
    return this.alumnoRepository.save(alumno);
  }

  //  MÉTODO 'remove' CON TRANSACCIÓN Y CASCADA 
  async remove(legajoAlumno: number): Promise<Alumno> {
    
    // this.dataSource.transaction maneja automáticamente el 'commit' y 'rollback'
    return this.dataSource.transaction(async (transactionalEntityManager) => {
        
        // 1. Buscamos al alumno DENTRO de la transacción
        const alumno = await transactionalEntityManager.findOne(Alumno, {
            where: { legajoAlumno },
        });

        if (!alumno) {
            throw new NotFoundException(`Alumno con legajo ${legajoAlumno} no encontrado.`);
        }

        // 2. LÓGICA DE CASCADA: Actualizamos las inscripciones
        // Ponemos 'RETIRADO' en todas las inscripciones activas o pendientes de este alumno
        await transactionalEntityManager.update(
            Inscripcion, 
            { // Cláusula 'where'
                alumnoLegajo: legajoAlumno,
                estado: In([ EstadoInscripcion.ACTIVO, EstadoInscripcion.INSCRITO ])
            }, 
            { // Cláusula 'set'
                estado: EstadoInscripcion.RETIRADO 
            },
        );

        // 3. Ejecutamos la baja lógica del alumno
        alumno.activo = false; 
        
        // 4. Guardamos al alumno DENTRO de la transacción
        return transactionalEntityManager.save(alumno);
    });
  }

  async reactivate(legajoAlumno: number): Promise<Alumno> {
    const alumno = await this.findOne(legajoAlumno); 
    alumno.activo = true; 
    return this.alumnoRepository.save(alumno);
  }
}