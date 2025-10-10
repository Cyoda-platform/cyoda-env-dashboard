export interface Task {
  id: string;
  title: string;
  srcEntityId: string;
  state: string;
  lastModifiedDatetime: string;
  createdDatetime: string;
  assignee: string;
  alertDefId: string;
  type: number;
  priority: number;
  timestamp: number;
  message: string;
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

export interface Login {
  username: string;
  password: string;
}
