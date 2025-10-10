export interface Task {
  id: string;
  title: string;
  srcAlertId: string;
  state: string;
  lastModifiedDatetime: string;
  createdDatetime: string;
  assignee: string;
  alertDefId: string;
  type: number;
  priority: number;
  timestamp: number;
  message: string;
  srcEntityId: string;
  srcEntityClass: string;
  properties: {
    shorts: any;
    ints: any;
    longs: {
      itemComplete: number;
    };
    floats: any;
    doubles: {
      BaseCcyAmount: number;
    };
    bools: {
      itemComplete: boolean;
    };
    strings: {
      PaymentExecutionId: string;
    };
  };
  formattedProperties: {
    shorts: any;
    ints: any;
    longs: {
      itemComplete: number;
    };
    floats: any;
    doubles: {
      BaseCcyAmount: number;
    };
    bools: {
      itemComplete: boolean;
    };
    strings: any;
  };
  group: any;
  configType: any;
}

export interface TaskFilterType {
  status_id?: string;
  assignee_id?: string;
  priority_id?: string;
}

export interface TableRow {
  id: string;
  title: string;
  state: string;
  priority: number;
  priority_name: string;
  assigned_to_name: string;
  timestamp: number;
  timestamp_name: string;
  agent_event: string;
  task: Task;
}

export interface TasksRequestParams {
  page: number;
  size: number;
  state: string;
  assignee: string;
  priority: string;
}
