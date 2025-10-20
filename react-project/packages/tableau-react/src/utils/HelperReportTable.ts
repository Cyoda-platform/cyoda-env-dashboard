/**
 * HelperReportTable Utility
 * Migrated from: .old_project/packages/http-api/src/helpers/HelperReportTable.ts
 */

export interface GroupHeaderSummary {
  [key: string]: {
    values: {
      COUNT: number;
      [key: string]: number;
    };
  };
}

export interface WrappedEntityModel {
  content: {
    columnNames: string[];
    commonGroupValues: {
      [key: string]: string;
    };
    groupLevel: number;
    groupValues: string[];
    groupValuesJson: string;
    groupValuesJsonBase64: string;
    isNext: boolean;
    leaf: boolean;
    parentGroupValuesJson: string | null;
    summary: GroupHeaderSummary;
    groupId?: string;
    parentId?: string;
  };
  _links: {
    '/report/{id}/{grouping_version}/groups/{parent_group_json_base64}'?: {
      href: string;
      title: string;
      type: string;
    };
    '/report/{id}/group_rows/{group_json_base64}': {
      href: string;
      title: string;
      type: string;
    };
  };
}

export interface ReportGroup {
  _embedded: {
    wrappedEntityModels: WrappedEntityModel[];
  };
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

export interface TableColumn {
  label: string;
  prop: string;
}

export default class HelperReportTable {
  /**
   * Get column headers from group data
   */
  public static getHeaderHistoryGroupColumns(groups: ReportGroup): TableColumn[] {
    const columns: TableColumn[] = [];
    
    if (
      groups._embedded &&
      groups._embedded.wrappedEntityModels &&
      groups._embedded.wrappedEntityModels[0]?.content?.summary
    ) {
      const target = groups._embedded.wrappedEntityModels[0].content.summary;
      Object.keys(target).forEach((field) => {
        Object.keys(target[field].values).forEach((sumEl) => {
          columns.push({
            label: `${sumEl.toLowerCase()}(${field})`,
            prop: field.replace(/\./g, '_'),
          });
        });
      });
    }
    
    return columns;
  }

  /**
   * Get summary data from group content
   */
  public static getHeaderHistoryGroupSummaryData(summary: GroupHeaderSummary): Record<string, number> {
    const data: Record<string, number> = {};
    
    if (!summary) return data;
    
    Object.keys(summary).forEach((field) => {
      const fieldKey = field.replace(/\./g, '_');
      Object.keys(summary[field].values).forEach((sumEl) => {
        data[fieldKey] = summary[field].values[sumEl];
      });
    });
    
    return data;
  }

  /**
   * Format group row data
   */
  public static formatGroupRow(model: WrappedEntityModel): any {
    const row: any = {
      group: `Group - ${model.content.groupValues.join(' | ')}`,
      _link_rows: model._links['/report/{id}/group_rows/{group_json_base64}'].href,
      _link_groups:
        model._links['/report/{id}/{grouping_version}/groups/{parent_group_json_base64}']?.href ||
        null,
      isNext: model.content.isNext,
    };

    // Add summary data
    const summaryData = this.getHeaderHistoryGroupSummaryData(model.content.summary);
    return {
      ...row,
      ...summaryData,
    };
  }
}

