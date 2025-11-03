import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Inscripcion } from '../../inscripciones/entities/inscripcione.entity'; 
import { Profesor } from '../../profesores/entities/profesore.entity';     

@Entity('cursos')
export class Curso {
  @PrimaryGeneratedColumn()
  id: number; 

  @Column({ length: 100, unique: true })
  nombre: string;

  @Column('text')
  descripcion: string;

  @Column({ default: 40 })
  duracion: number;

  @Column({ default: true })
  activo: boolean;
  
  @ManyToOne(() => Profesor)
  @JoinColumn({ name: 'profesorLegajo', referencedColumnName: 'legajoProfesor' })
  profesor: Profesor;

  @Column({ nullable: true })
  profesorLegajo: number | null; 

  @OneToMany(() => Inscripcion, (inscripcion) => inscripcion.curso)
  inscripciones: Inscripcion[];
}
