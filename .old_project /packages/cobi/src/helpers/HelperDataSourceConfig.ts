import type {
  DataSourceConfigDto,
  HttpConnectionDetailsDto,
  HttpEndpointDto,
  SqlConnectionDetailsDto,
  SqlEndpointDto,
  WorkflowConnectionDetailsDto,
  WorkflowEndpointDto
} from "../components/DataSourceConfig/DataSourceConfig.d.ts";
import {v4 as uuidv4} from "uuid";

export default class HelperDataSourceConfig {
  static endpointParameterTypeOptions = [
    {
      value: "PATH_VARIABLE",
      label: "Path Variable",
    },
    {
      value: "REQUEST_BODY_VARIABLE",
      label: "Request Body Variable",
    },
    {
      value: "REQUEST_PARAM",
      label: "Request Param",
    },
    {
      value: "HEADER_PARAM",
      label: "Header Param",
    },
    {
      value: "TEMPLATE_VARIABLE",
      label: "Template Variable",
    },
    {
      value: "CUSTOM_PARAM",
      label: "Custom Param",
    },
  ];

  static getNameFromEndpointParameterTypeOptions(value: string) {
    const options = HelperDataSourceConfig.endpointParameterTypeOptions;
    const used = options.find((el) => el.value == value);
    if (used) {
      return used.label;
    }
    return "";
  }

  static endpointParameterSqlTypeOptions = [
    {
      value: "BOOLEAN",
      label: "Boolean",
    },
    {
      value: "INT",
      label: "Integer",
    },
    {
      value: "DOUBLE",
      label: "Double",
    },
    {
      value: "STRING",
      label: "String",
    },
  ];

  static getNameFromEndpointParameterSqlTypeOptions(value: string) {
    const options = HelperDataSourceConfig.endpointParameterSqlTypeOptions;
    const used = options.find((el) => el.value == value);
    if (used) {
      return used.label;
    }
    return "";
  }

  static endpointMethodOptions = [
    {
      value: "GET",
      label: "Get",
    },
    {
      value: "POST_FORM",
      label: "Post Form",
    },
    {
      value: "POST_BODY",
      label: "Post Body",
    },
  ];

  static getNameFromEndpointMethodOptions(value: string) {
    const options = HelperDataSourceConfig.endpointMethodOptions;
    const used = options.find((el) => el.value == value);
    if (used) {
      return used.label;
    }
    return "";
  }

  static mappingConfigDtoConvertToUi(data: DataSourceConfigDto) {
    data.connections.forEach((connectionDetails) => {
      if (connectionDetails["@bean"].indexOf('Http') > -1 && !connectionDetails.authConfig) {
        if (!connectionDetails.authConfig) {
          connectionDetails.authConfig = this.getDefaultAuthConfig()
        }
      }
    });

    data.endpoints.forEach((el) => {
      if (!el.chatBotId) el.chatBotId = uuidv4();
    })
    return data;
  }

  static getDefaultAuthConfig() {
    return JSON.parse(JSON.stringify({
        name: "",
        authOperationConfigs: [],
        numOfRetries: 1,
        cacheConfig: {
          ttl: 0,
          persistCache: false,
        }
      }
    ))
  }

  static getEndpointType(endpoint: HttpEndpointDto | SqlEndpointDto | WorkflowEndpointDto) {
    if (endpoint['@bean'].indexOf('Http') > -1) {
      return "Http";
    }
    if (endpoint['@bean'].indexOf('Sql') > -1) {
      return "Sql";
    }
    if (endpoint['@bean'].indexOf('Workflow') > -1) {
      return "Workflow";
    }
    if (endpoint['@bean'].indexOf('BlobStorage') > -1) {
      return "BlobStorage";
    }
  }

  static geConnectionType(connection: HttpConnectionDetailsDto | SqlConnectionDetailsDto | WorkflowConnectionDetailsDto) {
    if (connection['@bean'].indexOf('Http') > -1) {
      return "Http";
    }
    if (connection['@bean'].indexOf('Sql') > -1) {
      return "Sql";
    }
    if (connection['@bean'].indexOf('Workflow') > -1) {
      return "Workflow";
    }
    if (connection['@bean'].indexOf('BlobStorage') > -1) {
      return "BlobStorage";
    }
  }
}
