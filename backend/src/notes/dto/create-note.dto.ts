export class CreateNoteDto {
  title: string;
  content: string;
  // Añade esta línea:
  categories?: string[]; 
}