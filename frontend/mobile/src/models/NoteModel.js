export const NoteTypes = {
  TEXT: 'text',
  DRAWING: 'drawing',
  AUDIO: 'audio',
  MIXED: 'mixed'
};

export const NoteStatus = {
  DRAFT: 'draft',     // Taslak - düzenlenebilir
  PUBLISHED: 'published', // Yayınlandı - salt okunur
  ARCHIVED: 'archived'  // Arşivlendi
};

export class Note {
  constructor({
    id,
    title,
    content,
    noteType = NoteTypes.TEXT,
    status = NoteStatus.PUBLISHED,
    drawingData = null,
    audioData = null,
    images = [],
    createdAt,
    updatedAt,
    userId
  }) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.noteType = noteType;
    this.status = status;
    this.drawingData = drawingData;
    this.audioData = audioData;
    this.images = images;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.userId = userId;
  }

  isDraft() {
    return this.status === NoteStatus.DRAFT;
  }

  isPublished() {
    return this.status === NoteStatus.PUBLISHED;
  }

  isEditable() {
    return this.status === NoteStatus.DRAFT || this.status === NoteStatus.PUBLISHED;
  }
}
