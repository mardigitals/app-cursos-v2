import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  ParseIntPipe, 
  HttpCode, 
  HttpStatus 
} from '@nestjs/common';
import { ProfesoresService } from './profesores.service';
import { CreateProfesorDto } from './dto/create-profesor.dto';
import { UpdateProfesorDto } from './dto/update-profesor.dto';
import { Profesor } from './entities/profesore.entity'; // Tipificación

@Controller('profesores')
export class ProfesoresController {
  constructor(private readonly profesoresService: ProfesoresService) {}

  // POST /profesores (Crear)
  @Post()
  create(@Body() createProfesorDto: CreateProfesorDto): Promise<Profesor> { 
    return this.profesoresService.create(createProfesorDto);
  }

  // GET /profesores (Leer Todos)
  @Get()
  findAll(): Promise<Profesor[]> { 
    return this.profesoresService.findAll();
  }

  // GET /profesores/:legajo (Leer Uno)
  @Get(':legajo')
  findOne(@Param('legajo', ParseIntPipe) legajo: number): Promise<Profesor> {
    return this.profesoresService.findOne(legajo);
  }

  // PATCH /profesores/:legajo (Actualizar)
  @Patch(':legajo')
  update(
    @Param('legajo', ParseIntPipe) legajo: number, 
    @Body() updateProfesorDto: UpdateProfesorDto
  ): Promise<Profesor> {
    return this.profesoresService.update(legajo, updateProfesorDto);
  }

  // DELETE /profesores/:legajo (Baja Lógica / Desactivar)
  @Delete(':legajo')
  @HttpCode(HttpStatus.NO_CONTENT) // Retorna 204 No Content
  remove(@Param('legajo', ParseIntPipe) legajo: number): Promise<void> {
    return this.profesoresService.remove(legajo).then(() => {}); 
  }

  // --- ¡NUEVO ENDPOINT AÑADIDO! ---

  /**
   * Endpoint para reactivar un profesor (baja lógica inversa).
   * Llama al servicio reactivate que cambia activo a 'true'.
   */
  // PATCH /profesores/:legajo/reactivate
  @Patch(':legajo/reactivate')
  reactivate(@Param('legajo', ParseIntPipe) legajo: number): Promise<Profesor> {
    return this.profesoresService.reactivate(legajo);
  }
}