import { Entity, Unique,PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Alumno } from '../../alumnos/entities/alumno.entity';
import { Curso } from '../../cursos/entities/curso.entity';   
import { Nota } from '../../notas/entities/nota.entity';      

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

  @JoinColumn({ name: 'alumnoLegajo', referencedColumnName: 'legajoAlumno' })
  alumno: Alumno;
  

  @Column()
  alumnoLegajo: number; 

  @ManyToOne(() => Curso, (curso) => curso.inscripciones)
  @JoinColumn({ name: 'cursoId', referencedColumnName: 'id' })
  curso: Curso;
  
  @Column()
  cursoId: number; 

  @Column({
    type: 'enum',
    enum: EstadoInscripcion,
    default: EstadoInscripcion.INSCRITO,
  })
  estado: EstadoInscripcion; 


  @OneToMany(() => Nota, (nota) => nota.inscripcion)
  notas: Nota[];
}


