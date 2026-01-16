import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';
import { Note } from './entities/note.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Note])], // Esto permite usar Note en el Service
  controllers: [NotesController],
  providers: [NotesService],
})
export class NotesModule {}