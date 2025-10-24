/**
 * State Machine Types
 * TypeScript type definitions for state machine entities
 * Migrated from: .old_project/packages/statemachine
 */

// Workflow Types
export interface Workflow {
  id: string;
  name: string;
  entityClassName: string;
  entityClassNameLabel?: string;
  active: boolean;
  persisted: boolean;
  persistedType?: string;
  creationDate: number;
  creationDateMkTime?: number;
}

export interface WorkflowForm {
  id?: string;
  name: string;
  entityClassName: string;
  active: boolean;
  persisted: boolean;
  description?: string;
  documentLink?: string;
  criteriaIds?: string[];
  useDecisionTree?: boolean;
}

// State Types
export interface State {
  id: string;
  name: string;
  description?: string;
  workflowId: string;
  initial?: boolean;
  terminal?: boolean;
}

export interface StateForm {
  id?: string;
  name: string;
  description?: string;
  initial?: boolean;
  terminal?: boolean;
}

// Transition Types
export interface Transition {
  id: string;
  name: string;
  description?: string;
  workflowId: string;
  fromState: string;
  toState: string;
  criteriaId?: string;
  processId?: string;
  automatic?: boolean;
}

export interface TransitionForm {
  id?: string;
  name: string;
  description?: string;
  fromState: string;
  toState: string;
  criteriaId?: string;
  processId?: string;
  automatic?: boolean;
}

// Criteria Types
export interface Criteria {
  id: string;
  name: string;
  description?: string;
  entityClassName?: string;
  condition?: Condition;
}

export interface Condition {
  '@bean': string;
  operator?: 'AND' | 'OR';
  conditions?: Condition[];
  [key: string]: any;
}

export interface CriteriaForm {
  '@bean'?: string;
  id?: string;
  name: string;
  description?: string;
  entityClassName?: string;
  condition?: Condition;
  criteriaChecker?: string;
  parameters?: any[];
  colDefs?: any[];
  aliasDefs?: any[];
}

// Process Types
export interface Process {
  id: string;
  name: string;
  description?: string;
  entityClassName?: string;
  processorClassName?: string;
  syncProcess?: boolean;
  newTransactionForAsync?: boolean;
  isTemplate?: boolean;
  parameters?: any[];
  processorId?: string;
  template?: string;
  config?: any;
}

export interface ProcessForm {
  '@bean'?: string;
  id?: string;
  name: string;
  description?: string;
  entityClassName?: string;
  processorClassName?: string;
  syncProcess?: boolean;
  newTransactionForAsync?: boolean;
  isTemplate?: boolean;
  parameters?: any[];
  processorId?: string;
  template?: string;
  config?: any;
}

// Instance Types
export interface Instance {
  entityId: string;
  entityClassName: string;
  entityClassNameLabel?: string;
  currentWorkflowId?: string;
  state: string;
  creationDate: number;
  lastUpdateTime: number;
  deleted?: boolean;
}

export interface InstancesRequest {
  entityClassName: string;
  filter?: string;
  offset?: number;
  limit?: number;
  rangeCondition?: RangeCondition;
}

export interface InstancesResponse {
  instances: Instance[];
  pagingFilter: {
    offset: number;
    limit: number;
  };
  hasMore: boolean;
}

export interface RangeCondition {
  fromDate?: number;
  toDate?: number;
  field?: string;
}

// Graphical State Machine Types
export interface Position {
  x: number;
  y: number;
}

export interface PositionsMap {
  [key: string]: Position;
}

export interface NodeConfig {
  data: {
    id: string;
    entityId?: string;
    title?: string;
    fullTitle?: string;
    persisted?: boolean;
    type?: string;
    source?: string;
    target?: string;
    parent?: string;
    transitionId?: string;
  };
  classes?: string;
  position?: Position;
  locked?: boolean;
  group?: string;
  grabbable?: boolean;
  selectable?: boolean;
}

export interface GraphicalStatemachineState {
  positionsMap: PositionsMap | null;
  transitionsShowHideList: string[];
}

// Entity Info Types
export interface EntityInfo {
  value: string;
  label: string;
}

export interface ColDef {
  colPath: string;
  type: string;
  label?: string;
}

// Table Row Types (for UI)
export interface WorkflowTableRow extends Workflow {
  key: string;
}

export interface InstanceTableRow extends Instance {
  key: string;
}

// Filter Types
export interface WorkflowFilter {
  filter: string;
  pageSize: number;
  currentPage: number;
}

export interface InstanceFilter {
  entityClassName: string;
  filter: string;
  isShowAdvanced?: boolean;
  rangeCondition?: RangeCondition;
}

// Export/Import Types
export interface ExportData {
  workflows?: Workflow[];
  transitions?: Transition[];
  criteria?: Criteria[];
  processes?: Process[];
}

// Persisted Type
export type PersistedType = 'persisted' | 'transient';

// Layout Mode
export type LayoutMode = 'tabular' | 'graphical';

