import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfesoresService } from './profesores.service';
import { ProfesoresController } from './profesores.controller';
import { Profesor } from './entities/profesore.entity'; 

@Module({
  imports: [TypeOrmModule.forFeature([Profesor])],
  controllers: [ProfesoresController],
  providers: [ProfesoresService],
  exports: [ProfesoresService]
})
export class ProfesoresModule {}