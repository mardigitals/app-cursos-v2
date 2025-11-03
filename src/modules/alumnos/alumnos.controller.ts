import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  ParseIntPipe, // Importación clave para validar el ID como número
  HttpCode,      // Importación para cambiar el código de estado HTTP
  HttpStatus,    // Importación para los códigos de estado
  NotFoundException // Aunque el servicio lo lanza, es bueno tenerlo
} from '@nestjs/common';
import { AlumnosService } from './alumnos.service';
import { CreateAlumnoDto } from './dto/create-alumno.dto';
import { UpdateAlumnoDto } from './dto/update-alumno.dto';
import { Alumno } from './entities/alumno.entity'; // Importa la entidad para la tipificación

@Controller('alumnos')
export class AlumnosController {
  constructor(private readonly alumnosService: AlumnosService) {}

  // POST /alumnos (Crear)
  @Post()
  // Tipifica la respuesta (promete devolver un Alumno)
  create(@Body() createAlumnoDto: CreateAlumnoDto): Promise<Alumno> { 
    return this.alumnosService.create(createAlumnoDto);
  }

  // GET /alumnos (Leer Todos)
  // Tipifica la respuesta (promete devolver un array de Alumno)
  @Get()
  findAll(): Promise<Alumno[]> { 
    return this.alumnosService.findAll();
  }

  // GET /alumnos/:legajo (Leer Uno)
  @Get(':legajo')
  // CORRECCIÓN 1: Cambia ':id' a ':legajo' para claridad.
  // CORRECCIÓN 2: Usa ParseIntPipe para garantizar que sea un número.
  findOne(@Param('legajo', ParseIntPipe) legajo: number): Promise<Alumno> {
    // El servicio findOne ya lanza NotFoundException, por lo que no necesitamos un 'if' aquí
    return this.alumnosService.findOne(legajo);
  }

  // PATCH /alumnos/:legajo (Actualizar)
  @Patch(':legajo')
  // CORRECCIÓN 1: Usa ParseIntPipe.
  // CORRECCIÓN 2: Tipifica la respuesta.
  update(
    @Param('legajo', ParseIntPipe) legajo: number, 
    @Body() updateAlumnoDto: UpdateAlumnoDto
  ): Promise<Alumno> {
    return this.alumnosService.update(legajo, updateAlumnoDto);
  }

  // DELETE /alumnos/:legajo (Baja Lógica)
  @Delete(':legajo')
  // CORRECCIÓN 1: Usa ParseIntPipe.
  // CORRECCIÓN 2: Usa @HttpCode(204) para retornar "No Content" si el DELETE es exitoso.
  @HttpCode(HttpStatus.NO_CONTENT) 
  remove(@Param('legajo', ParseIntPipe) legajo: number): Promise<void> {
    // El servicio retorna el alumno con activo=false, pero el controller retorna 204
    return this.alumnosService.remove(legajo).then(() => {}); 
  }


  @Patch(':legajo/reactivate')
  reactivate(@Param('legajo', ParseIntPipe) legajo: number): Promise<Alumno> {
    return this.alumnosService.reactivate(legajo);
  }
}