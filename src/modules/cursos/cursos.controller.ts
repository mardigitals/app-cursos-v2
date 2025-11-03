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
  HttpStatus, 
  NotFoundException 
} from '@nestjs/common';
import { CursosService } from './cursos.service';
import { CreateCursoDto } from './dto/create-curso.dto';
import { UpdateCursoDto } from './dto/update-curso.dto';
import { Curso } from './entities/curso.entity';

@Controller('cursos')
export class CursosController {
  constructor(private readonly cursosService: CursosService) {}

  // POST /cursos
  @Post()
  create(@Body() createCursoDto: CreateCursoDto): Promise<Curso> {
    return this.cursosService.create(createCursoDto);
  }

  // GET /cursos
  @Get()
  findAll(): Promise<Curso[]> {
    return this.cursosService.findAll();
  }

  // GET /cursos/:id
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Curso> {
    return this.cursosService.findOne(id);
  }

  // PATCH /cursos/:id
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateCursoDto: UpdateCursoDto
  ): Promise<Curso> {
    return this.cursosService.update(id, updateCursoDto);
  }

  // DELETE /cursos/:id (Baja Lógica / Desactivar)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.cursosService.remove(id).then(() => {});
  }

  // --- ¡NUEVO ENDPOINT AÑADIDO! ---

  /**
   * Endpoint para reactivar un curso (baja lógica inversa).
   * Llama al servicio reactivate que cambia activo a 'true'.
   */
  // PATCH /cursos/:id/reactivate
  @Patch(':id/reactivate')
  reactivate(@Param('id', ParseIntPipe) id: number): Promise<Curso> {
    return this.cursosService.reactivate(id);
  }
}