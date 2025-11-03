import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Inscripcion } from '../../inscripciones/entities/inscripcione.entity'; 

@Entity('notas')
export class Nota {
  @PrimaryGeneratedColumn()
  id: number; 

  @Column({ length: 100 })
  nombreEvaluacion: string; 

  @Column('decimal', { precision: 5, scale: 2 }) 
  calificacion: number; 

  @Column({ type: 'datetime', default: () => 'now()' }) 
  fechaRegistro: Date; 

  // --- Relación con Inscripción (Muchos a Uno) ---
  @ManyToOne(() => Inscripcion, (inscripcion) => inscripcion.notas)
  @JoinColumn({ name: 'inscripcionId', referencedColumnName: 'id' })
  inscripcion: Inscripcion;

  @Column()
  inscripcionId: number; 
}
