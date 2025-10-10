import type { GroupHeaderSummary, ReportGroup } from "@cyoda/ui-lib/src/types/types";

export default class HelperReportTable {
  public static getHeaderHistoryGroupColumns(groups: ReportGroup) {
    const columns: Array<{ label: string; prop: string }> = [];
    if (
      groups._embedded &&
      groups._embedded.wrappedEntityModels &&
      groups._embedded.wrappedEntityModels[0].content.summary
    ) {
      const target = groups._embedded.wrappedEntityModels[0].content.summary;
      Object.keys(target).forEach((field) => {
        Object.keys(target[field].values).forEach((sumEl) => {
          columns.push({
            label: `${sumEl.toLowerCase()}(${field})`,
            prop: field.replace(/\./g, "_"),
          });
        });
      });
    }
    return columns;
  }

  public static getHeaderHistoryGroupSummaryData(summary: GroupHeaderSummary) {
    const row: { [key: string]: string } = {};
    Object.keys(summary).forEach((field) => {
      Object.keys(summary[field].values).forEach((sumEl) => {
        // @ts-ignore
        row[`${field.replace(/\./g, "_")}`] = summary[field].values[sumEl];
      });
    });
    return row;
  }
}
