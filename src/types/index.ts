export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder' | 'freefolder';
  icon: string;
  position: { x: number; y: number };
  size?: number;
  lastModified?: Date;
  content?: FileItem[]; // For folders and freefolders
}

export interface DragState {
  isDragging: boolean;
  draggedItem: FileItem | null;
  dragOffset: { x: number; y: number };
}