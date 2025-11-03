import { Entity, Unique,PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Alumno } from '../../alumnos/entities/alumno.entity'; // RUTA CORREGIDA
import { Curso } from '../../cursos/entities/curso.entity';   // RUTA CORREGIDA
import { Nota } from '../../notas/entities/nota.entity';       // RUTA CORREGIDA (Asumiendo que seguirás el mismo patrón para Notas)

// Definición de los posibles estados del alumno en un curso
export enum EstadoInscripcion {
  INSCRITO = 'INSCRITO',
  ACTIVO = 'ACTIVO',
  COMPLETADO = 'COMPLETADO',
  RETIRADO = 'RETIRADO',
}
@Unique(["alumnoLegajo", "cursoId"])
@Entity('inscripciones')
export class Inscripcion {
  @PrimaryGeneratedColumn()
  id: number; 

  @ManyToOne(() => Alumno, (alumno) => alumno.inscripciones)
  // Referencia la clave primaria del Alumno: legajoAlumno
  @JoinColumn({ name: 'alumnoLegajo', referencedColumnName: 'legajoAlumno' })
  alumno: Alumno;
  
  // Columna de clave foránea.
  @Column()
  alumnoLegajo: number; 

  // --- Relación con Curso (Muchos a Uno) ---
  @ManyToOne(() => Curso, (curso) => curso.inscripciones)
  // Referencia la clave primaria del Curso: id
  @JoinColumn({ name: 'cursoId', referencedColumnName: 'id' })
  curso: Curso;
  
  // Columna de clave foránea.
  @Column()
  cursoId: number; 
  
  // Campo de Lógica de Negocio: Estado del alumno en el curso
  @Column({
    type: 'enum',
    enum: EstadoInscripcion,
    default: EstadoInscripcion.INSCRITO,
  })
  estado: EstadoInscripcion; 

  // --- Relación con Nota (Uno a Muchos) ---
  @OneToMany(() => Nota, (nota) => nota.inscripcion)
  notas: Nota[];
}


