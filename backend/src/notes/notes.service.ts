import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from './entities/note.entity';
import { CreateNoteDto } from './dto/create-note.dto'; // Importación necesaria
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private readonly noteRepository: Repository<Note>, // El nombre aquí es noteRepository
  ) {}

  // 1. Crear una nota (Combinamos los dos métodos en uno solo y limpio)
  async create(createNoteDto: CreateNoteDto): Promise<Note> {
    const newNote = this.noteRepository.create(createNoteDto);
    return await this.noteRepository.save(newNote);
  }

  // 2. Listar notas
  async findAll(isArchived: boolean = false): Promise<Note[]> {
    return await this.noteRepository.find({
      where: { isArchived },
      order: { createdAt: 'DESC' },
    });
  }

  // 3. Buscar por ID
  async findOne(id: number): Promise<Note> {
    const note = await this.noteRepository.findOneBy({ id });
    if (!note) throw new NotFoundException(`Nota con ID ${id} no encontrada`);
    return note;
  }

  // 4. Editar nota
  async update(id: number, updateNoteDto: UpdateNoteDto): Promise<Note> {
    await this.findOne(id); 
    await this.noteRepository.update(id, updateNoteDto);
    return this.findOne(id);
  }

  // 5. Eliminar nota
  async remove(id: number): Promise<void> {
    const note = await this.findOne(id);
    await this.noteRepository.remove(note);
  }
}