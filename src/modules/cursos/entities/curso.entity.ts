import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Inscripcion } from '../../inscripciones/entities/inscripcione.entity'; // Ruta ajustada a tu estructura
import { Profesor } from '../../profesores/entities/profesore.entity';     // Ruta ajustada a tu estructura

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
  
  // --- Relación con Profesor (Muchos Cursos a Un Profesor) ---
  // Asumimos una relación simple por ahora: un curso es dictado por un profesor.
  @ManyToOne(() => Profesor)
  // Referencia la clave primaria del Profesor: legajoProfesor
  @JoinColumn({ name: 'profesorLegajo', referencedColumnName: 'legajoProfesor' })
  profesor: Profesor;

  @Column({ nullable: true })
  profesorLegajo: number | null; // Clave foránea al Profesor

  // --- Relación con Inscripción (Uno a Muchos) ---
  // Esta es la "lista de alumnos" (vía registros de inscripción)
  @OneToMany(() => Inscripcion, (inscripcion) => inscripcion.curso)
  inscripciones: Inscripcion[];
}
