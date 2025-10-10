interface JQuery {
  resizable(p0: string | ResizableOption, p1?: "handles", p3?: string): void;
  draggable(p0: string | DraggableOption): void;
}

interface JQueryStatic {
  resizable(p0: string | ResizableOption, p1?: "handles", p3?: string): void;
}

interface ResizableOption {
  helper: string;
  handles: string;
  stop: () => void;
}

interface DraggableOption {
  containment?: string;
  stop?: () => void;
  drag?: () => void;
  start?: () => void;
}
