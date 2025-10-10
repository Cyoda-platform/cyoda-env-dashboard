import { Virtual } from "../Virtual";

export interface ChainingConfigDto {
  "@bean": string;
  id: string | null;
  datasourceId: string;
  name: string;
  description: string;
  nextOperation: string;
  rootRelativePaths: { [key: string]: string };
  parameters: ChainingParameterDto[];
  virtual?: Virtual;
  lastUpdated?: number;
}

export interface ChainingParameterDto {
  nextOperationParameterName: string;
  srcRelativePath: string;
}
