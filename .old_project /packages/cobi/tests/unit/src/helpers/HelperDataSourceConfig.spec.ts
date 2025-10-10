import HelperDataSourceConfig from "../../../../src/helpers/HelperDataSourceConfig";

describe("HelperDataSourceConfig", () => {

  describe("getNameFromEndpointParameterTypeOptions", () => {
    it("should get name from endpoint parameter type options", () => {
      const value = "REQUEST_BODY_VARIABLE";
      const result = HelperDataSourceConfig.getNameFromEndpointParameterTypeOptions(value);
      expect(result).toBe("Request Body Variable");
    });

    it("should get empty value from endpoint parameter type options", () => {
      const value = "BLA_BLA";
      const result = HelperDataSourceConfig.getNameFromEndpointParameterTypeOptions(value);
      expect(result).toBe("");
    });
  })

  describe("getNameFromEndpointParameterSqlTypeOptions", () => {
    it("should get name from endpoint parameter SQL type options", () => {
      const value = "INT";
      const result = HelperDataSourceConfig.getNameFromEndpointParameterSqlTypeOptions(value);
      expect(result).toBe("Integer");
    });

    it("should get empty value from endpoint parameter SQL type options", () => {
      const value = "BLA_BLA";
      const result = HelperDataSourceConfig.getNameFromEndpointParameterSqlTypeOptions(value);
      expect(result).toBe("");
    });
  });

  describe("getNameFromEndpointParameterSqlTypeOptions", () => {
    it("should get name from endpoint method options", () => {
      const value = "POST_FORM";
      const result = HelperDataSourceConfig.getNameFromEndpointMethodOptions(value);
      expect(result).toBe("Post Form");
    });

    it("should get empty value from endpoint method options", () => {
      const value = "BLA_BLA";
      const result = HelperDataSourceConfig.getNameFromEndpointMethodOptions(value);
      expect(result).toBe("");
    })
  });

  describe("getNameFromEndpointParameterSqlTypeOptions", () => {
    it("should get endpoint type from endpoint object for Http", () => {
      const endpoint = {
        "@bean": "HttpEndpointDto",
      };
      const result = HelperDataSourceConfig.getEndpointType(endpoint);
      expect(result).toBe("Http");
    });

    it("should get endpoint type from endpoint object for Sql", () => {
      const endpoint = {
        "@bean": "SqlEndpointDto",
      };
      const result = HelperDataSourceConfig.getEndpointType(endpoint);
      expect(result).toBe("Sql");
    });

    it("should get endpoint type from endpoint object for Workflow", () => {
      const endpoint = {
        "@bean": "WorkflowEndpointDto",
      };
      const result = HelperDataSourceConfig.getEndpointType(endpoint);
      expect(result).toBe("Workflow");
    });

    it("should get endpoint type from endpoint object for BlobStorage", () => {
      const endpoint = {
        "@bean": "BlobStorageEndpointDto",
      };
      const result = HelperDataSourceConfig.getEndpointType(endpoint);
      expect(result).toBe("BlobStorage");
    });
  });

  describe("getNameFromEndpointParameterSqlTypeOptions", () => {
    it("should get connection type from connection object for HTTP", () => {
      const connection: any = {
        "@bean": "HttpConnectionDetailsDto",
      };
      const result = HelperDataSourceConfig.geConnectionType(connection);
      expect(result).toBe("Http");
    });

    it("should get connection type from connection object for Sql", () => {
      const connection: any = {
        "@bean": "SqlConnectionDetailsDto",
      };
      const result = HelperDataSourceConfig.geConnectionType(connection);
      expect(result).toBe("Sql");
    });

    it("should get connection type from connection object for Workflow", () => {
      const connection: any = {
        "@bean": "WorkflowConnectionDetailsDto",
      };
      const result = HelperDataSourceConfig.geConnectionType(connection);
      expect(result).toBe("Workflow");
    });

    it("should get connection type from connection object for BlobStorage", () => {
      const connection: any = {
        "@bean": "BlobStorageConnectionDetailsDto",
      };
      const result = HelperDataSourceConfig.geConnectionType(connection);
      expect(result).toBe("BlobStorage");
    });
  });
});
