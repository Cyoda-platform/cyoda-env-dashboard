export interface LoadTableRows {
  totalElements: number;
  rows: Array<{
    [key: string]: string;
  }>;
}

export interface ConfigEditorStreamConfigDefinitionColRanges {
  fullPath: string;
  colType: string;
}
