import { 
  Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus 
} from '@nestjs/common';
import { InscripcionesService } from './inscripciones.service';
import { CreateInscripcioneDto } from './dto/create-inscripcione.dto';
import { UpdateInscripcioneDto } from './dto/update-inscripcione.dto';
import { Inscripcion } from './entities/inscripcione.entity';

@Controller('inscripciones')
export class InscripcionesController {
  constructor(private readonly inscripcionesService: InscripcionesService) {}

  @Post()
  create(@Body() createDto: CreateInscripcioneDto): Promise<Inscripcion> {
    return this.inscripcionesService.create(createDto);
  }

  @Get()
  findAll(): Promise<Inscripcion[]> {
    return this.inscripcionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Inscripcion> {
    return this.inscripcionesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateInscripcioneDto,
  ): Promise<Inscripcion> {
    return this.inscripcionesService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.inscripcionesService.remove(id).then(() => {});
  }
}
