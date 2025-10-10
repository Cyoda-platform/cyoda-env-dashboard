import {Virtual} from "../Virtual";
import type {Page} from "../../types/types";

export interface DataSourceConfigDto {
  "@bean": string;
  id: string | null;
  name: string;
  description: string;
  connections: HttpConnectionDetailsDto[] | SqlConnectionDetailsDto[];
  endpoints: HttpEndpointDto[] | SqlEndpointDto[];
  active: true;
  virtual?: Virtual;
  lastUpdated?: number;
}

export interface HttpEndpointConnectionCheckRequestDto {
  type: string;
  connectionDetails: ConnectionDetailsDto;
  endpointDetailsDto: EndpointDetailsDto;
  userParameters: UserParameter[];
}

export interface ConnectionDetailsDto {
  "@bean": string;
  name: string;
}

export interface HttpConnectionDetailsDto extends ConnectionDetailsDto {
  baseUrl?: string;
  authType?: string;
  proxyConfigurationKey?: string;
  headers?: { [key: string]: string };
  authConfig?: DataSourceAuthConfigDto;
}

export interface DataSourceAuthConfigDto {
  name: string;
  authOperationConfigs: DataSourceAuthOperationConfigDto[];
  numOfRetries: number;
  cacheConfig: DataSourceAuthCacheConfigDto;
}

export interface DataSourceAuthOperationConfigDto {
  authService: string;
  authServiceName: string;
  baseUrl: string;
  query: string;
  method: Method;
  bodyTemplate: string;
  headers: { [key: string]: string };
  parameters: HttpParameterDto[];
  dataSourceAuthRespConfig: DataSourceAuthRespConfigDto;
  connectionTimeout: number;
  readWriteTimeout: number;
  proxyConfigurationKey: string;
}

export interface DataSourceAuthRespConfigDto {
  "@bean": string;
  responseParser: string;
  responseParserName: string;
  responseParamToPathMap: { [key: string]: AuthRespParamPathDto };
}

export interface AuthRespParamPathDto {
  test: any;
}

export interface DataSourceAuthCacheConfigDto {
  ttl: number;
  persistCache: boolean;
}

export interface SqlConnectionDetailsDto extends ConnectionDetailsDto {
  jdbcUrl?: string;
  username?: string;
  password?: string;
  driverClassName?: string;
  connectionProperties?: { [key: string]: string };
}

export interface WorkflowConnectionDetailsDto extends ConnectionDetailsDto {
  entityClass? : string,
}

export interface EndpointDetailsDto {
  "@bean": string;
  operation: string;
  connectionIndex?: number;
  consumerConfig?: {
    configId: string;
    consumerType: string;
  }
}

export interface HttpEndpointDto extends EndpointDetailsDto {
  type?: string;
  query?: string;
  cache: RequestCacheDetailsDto;
  method?: Method;
  chainings?: string[];
  parameters?: HttpParameterDto[];
  bodyTemplate?: string;
  connectionTimeout?: number | null | undefined;
  readWriteTimeout?: number | null | undefined;
}

export type WorkflowEndpointDto = EndpointDetailsDto
export type BlobStorageEndpointDto = EndpointDetailsDto

export interface RequestCacheDetailsDto{
  parameters: string [];
  ttl: null;
}

export interface SqlEndpointDto extends EndpointDetailsDto {
  operation?: string;
  query?: string;
  parameters?: SqlParameterDto[];
  chainings?: string[];
}

export type Method = "GET" | "POST_FORM" | "POST_BODY";

export interface HttpParameterDto {
  type?: "PATH_VARIABLE" | "REQUEST_BODY_VARIABLE" | "REQUEST_PARAM" | "HEADER_PARAM" | "TEMPLATE_VARIABLE";
  name?: string;
  required?: boolean;
  defaultValue?: string;
  secure?: boolean;
  excludeFromCacheKey?: boolean;
  template?: boolean;
  templateValue?: string;
  optionValues?: string[];
}

export interface SqlParameterDto {
  name?: string;
  defaultValue?: string;
  sqlType?: "BOOLEAN" | "INT" | "DOUBLE" | "STRING";
  secure?: boolean;
  isArray?: boolean;
}

export interface BlobStorageParameterDto {
  name?: string;
  required?: boolean;
  defaultValue?: string;
  secure?: boolean;
  template?: boolean;
  templateValue?: string;
}

export interface TemplateVerificationDto {
  httpEndpointDto: HttpEndpointDto;
  userParameters: UserParameter[];
  authType: string;
}

export interface UserParameter {
  name: string;
  value: string;
  parameterType: string;
}


export interface RootStatistics {
  _embedded: {
    dataSourceRequestStatisticDtoes: DataSourceRequestStatisticDto[];
  };
  page: Page;
}

export interface ChildStatistics {
  _embedded: {
    dataSourceEndpointStatisticDtoes: DataSourceEndpointStatisticDto[];
  };
  page: Page;
}

export interface DataSourceRequestStatisticDto  {
  id: string;
  rootRawRequestId: string;
  dataSourceNames: string;
  classNames: string;
  mappingConfigNames: string;
  totalCreatedEntitiesCount: number;
  totalUpdatedEntitiesCount: number;
  timeStatistic: {
    startProcessing: number;
    finishProcessing: number;
  },
  status: string;
}

export interface DataSourceEndpointStatisticDto  {
  id: string;
  rootRawRequestId: string;
  requestId: string;
  dataSourceName: string;
  createdEntitiesCount: number;
  updatedEntitiesCount: number;
  mappingConfigName: string;
  className: string;
  timeStatistic: {
    startProcessing: number;
    finishProcessing: number;
  },
  chainingStep: number;
  status: string;
  operationData: {
    operation: string;
    parameters: {
      [key: string]: string;
    },
    clientData: {
      [key: string]: string;
    }
  }
}
