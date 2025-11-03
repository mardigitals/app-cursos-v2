import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Inscripcion } from '../../inscripciones/entities/inscripcione.entity'; 

@Entity('alumnos') 
export class Alumno {

  @PrimaryGeneratedColumn()
  legajoAlumno: number; 
  
  @Column({ length: 100 })
  nombre: string;
  
  @Column({ length: 100 })
  apellido: string;

  @Column({ type: 'date' })
  fechaNacimiento: Date;
  
  @Column({ unique: true })
  dni: string; 
  
  @Column({ unique: true })
  email: string; 
  
  @Column({ nullable: true })
  telefono: string; 

  @Column({ default: true }) 
  activo: boolean; 

  @OneToMany(() => Inscripcion, (inscripcion) => inscripcion.alumno)
  inscripciones: Inscripcion[];
}
