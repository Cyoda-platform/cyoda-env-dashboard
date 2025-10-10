import HelperConstants from "../../../src/helpers/HelperConstants";

describe("HelperConstants", () => {
  it("should have correct values for SIMPLE_COLUMN", () => {
    expect(HelperConstants.SIMPLE_COLUMN).toEqual("com.cyoda.core.reports.columns.ReportSimpleColumn");
  });

  it("should have correct values for SIMPLE_COLUMN_SHORT", () => {
    expect(HelperConstants.SIMPLE_COLUMN_SHORT).toEqual("ReportSimpleColumn");
  });

  it("should have correct values for ALIAS_COLUMN", () => {
    expect(HelperConstants.ALIAS_COLUMN).toEqual("com.cyoda.core.reports.columns.ReportAliasColumn");
  });

  it("should have correct values for ALIAS_COLUMN_SHORT", () => {
    expect(HelperConstants.ALIAS_COLUMN_SHORT).toEqual("ReportAliasColumn");
  });
});
