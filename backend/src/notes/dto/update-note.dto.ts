import { PartialType } from '@nestjs/mapped-types';
import { CreateNoteDto } from './create-note.dto';

// No escribas nada más aquí abajo, el PartialType ya hace la magia
export class UpdateNoteDto extends PartialType(CreateNoteDto) {}