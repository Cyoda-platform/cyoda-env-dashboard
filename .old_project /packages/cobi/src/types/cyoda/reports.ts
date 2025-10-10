export interface IGetDefinitionsQueryParams {
  user?: string;
  fields?: Array<"id" | "description" | "type" | "user">;
  size?: number;
}

export interface IGetDefinitionsArgs {
  pageUrl?: string;
  params: IGetDefinitionsQueryParams;
}

export interface ItemHistory {
  reportHistoryFields: {
    configName: string;
    createTime: string;
    finishTime: string;
    id: string;
    reportFailed: boolean;
    type: string;
    user: string;
  };
  _links?: any;
}

export interface IGetGroupsPathParams {
  reportId: string;
}
