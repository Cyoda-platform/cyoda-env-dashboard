import type {
  IDefinitionContent,
  IDefinitionContentConditionGroup,
  ItemHistory,
  StreamDataDef
} from "@cyoda/ui-lib/src/types/types";
import HelperConstants from "./HelperConstants";
import type {
  Alias,
  ConfigEditorReportsStreamStreamFilter,
  ConfigEditorReportsStreamTableDataRow,
  ConfigEditorReportsTableDataRow
} from "../views/ConfigEditor/type";
import * as api from "@cyoda/ui-lib/src/api";
import moment from "moment";
import _ from "lodash";
import HelperFormat from "@cyoda/ui-lib/src/helpers/HelperFormat";
import HelperStorage from "@cyoda/ui-lib/src/helpers/HelperStorage";
import HelperFeatureFlags from "@cyoda/ui-lib/src/helpers/HelperFeatureFlags.ts";
import { ref } from "vue";

const helperStorage = new HelperStorage();
const entityData = ref([]);
export default class HelperReportDefinition {
  static rangeConditionTypes = ["EQUALS", "LESS_THAN", "GREATER_THAN", "GREATER_OR_EQUAL", "BETWEEN", "NOT_EQUAL", "LESS_OR_EQUAL", "GREATER_OR_EQUAL", "BETWEEN_INCLUSIVE"];

  public static applyFiltersForReportTables(
    tableData: Array<
      ConfigEditorReportsStreamTableDataRow | ConfigEditorReportsTableDataRow
    >,
    filterForm: ConfigEditorReportsStreamStreamFilter
  ) {
    // Search by search
    tableData = tableData.filter((data) => {
      return (
        !filterForm.search ||
        data.name.toLowerCase().includes(filterForm.search.toLowerCase()) ||
        data.description.toLowerCase().includes(filterForm.search.toLowerCase())
      );
    });

    // Search by form authors
    if (filterForm && filterForm.authors && filterForm.authors.length > 0) {
      tableData = tableData.filter((data) => {
        return filterForm.authors.some((author) => data.username === author || (data as any).user === author);
      });
    }

    // Search by form time_custom
    if (filterForm && filterForm.time_custom) {
      tableData = tableData.filter((data) => {
        const targetTimeStamp = moment(filterForm.time_custom).format("X");
        return (
          data.created && targetTimeStamp < moment(data.created).format("X")
        );
      });
    }

    // Search by form entities
    if (filterForm && filterForm.entities && filterForm.entities.length > 0) {
      tableData = tableData.filter((data) => {
        return filterForm.entities.some((entity) => data.entity === entity);
      });
    }

    // Search by form state
    if (filterForm && filterForm.status && filterForm.status.length > 0) {
      tableData = tableData.filter((data) => {
        return filterForm.status.some((state) => data.state === state);
      });
    }

    // Search by EntityType
    if (filterForm && filterForm.entityType && HelperFeatureFlags.isUseModelsInfo()) {
      if (entityData.value.length === 0) {
        this.loadEntities();
      }
      const entitiesList = entityData.value.filter(el => el.type === filterForm.entityType).map((el) => el.name);
      tableData = tableData.filter((data) => {
        return entitiesList.some(el => el.includes(data.entity));
      });
    }
    return tableData;
  }

  static async loadEntities() {
    const { data } = await api.getReportingFetchTypes(true);
    entityData.value = data;
  }

  public static reportDefinition() {
    return JSON.parse(
      JSON.stringify({
        "@bean": "",
        description: "",
        requestClass: "",
        condition: {
          "@bean": "",
          operator: "",
          conditions: []
        },
        sorting: [],
        grouping: [],
        summary: [],
        columns: [],
        pointTime: "2200-01-01T00:00:00.000+03:00",
        colDefs: [],
        aliasDefs: [],
        valuationPointTime: "2020-01-27T14:09:28.778+03:00",
        singletonReport: false
      })
    );
  }

  public static reportSteamDefinition() {
    return JSON.parse(
      JSON.stringify({
        "@bean": "com.cyoda.core.streamdata.StreamDataConfigDef",
        streamDataDef: {
          requestClass: "",
          rangeOrder: "ASC",
          rangeCondition: {
            "@bean": "",
            fieldName: "",
            operation: "",
            value: {
              "@type": "",
              value: ""
            }
          },
          condition: {
            "@bean": "com.cyoda.core.conditions.GroupCondition",
            operator: "OR",
            conditions: []
          },
          columns: [],
          colDefs: [],
          aliasDefs: []
        },
        name: "",
        id: ""
      })
    );
  }

  public static currentUserName() {
    const auth = helperStorage.get("auth");
    if (auth && auth.username && auth.username) {
      return helperStorage.get("auth").username;
    }
    return "";
  }

  public static reportHistoryDefaultFilter() {
    return JSON.parse(
      JSON.stringify({
        authors: [],
        states: [],
        types: [],
        time_custom: null,
        entityType: "BUSINESS"
      })
    );
  }

  public static deleteUnUsedConditions(
    conditions: IDefinitionContentConditionGroup[]
  ) {
    conditions = conditions.filter((el) => {
      if (el.conditions) {
        el.conditions = this.deleteUnUsedConditions(
          el.conditions as IDefinitionContentConditionGroup[]
        );
      }
      return el["@bean"];
    });
    return conditions;
  }

  public static validateConfigDefinition(
    conditions: IDefinitionContentConditionGroup[]
  ) {
    for (const el of conditions) {
      if (!el["@bean"]) {
        return false;
      }
      if (el.conditions) {
        if (
          !this.validateConfigDefinition(
            el.conditions as IDefinitionContentConditionGroup[]
          )
        ) {
          return false;
        }
      }
    }
    return true;
  }

  public static buildCols(
    configDefinition: IDefinitionContent | StreamDataDef
  ) {
    let cols: Alias[] = [];
    if (configDefinition && configDefinition.colDefs && configDefinition.colDefs.length > 0) {
      const colDefs = configDefinition.colDefs.map((el) => {
        return {
          colType: "colDef",
          alias: el.fullPath,
          typeShort: el.colType.split(".").pop() || "",
          type: el.colType,
          "@bean": HelperConstants.SIMPLE_COLUMN
        };
      });
      cols = cols.concat(colDefs);
    }

    if (configDefinition && configDefinition.aliasDefs && configDefinition.aliasDefs.length > 0) {
      const aliasDefs = configDefinition.aliasDefs.map((el) => {
        return {
          colType: "aliasDef",
          alias: el.name,
          typeShort: el.aliasType.split(".").pop() || "",
          type: el.aliasType,
          "@bean": HelperConstants.ALIAS_COLUMN
        };
      });
      cols = cols.concat(aliasDefs);
    }
    return cols;
  }

  public static uuidv() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      // tslint:disable-next-line:no-bitwise one-variable-per-declaration
      const r = (Math.random() * 16) | 0,
        v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  public static async getAvgReportsTime(definitionId: string) {
    const reportHistoryFieldsViews: ItemHistory[] =
      await this.getLatestSuccessReportByDefinition(definitionId);

    const times: number[] = [];
    await Promise.all(
      reportHistoryFieldsViews.map(async (el) => {
        const { data } = await api.getStats(
          el.reportHistoryFields.id,
          el.reportHistoryFields.groupingVersion
        );
        const createTime = moment(data.createTime);
        const finishTime = moment(data.finishTime);
        const duration = moment.duration(finishTime.diff(createTime));
        times.push(duration.asMilliseconds());
      })
    );
    const mean = _.mean(times);
    const d = moment.duration(Math.ceil(mean), "milliseconds");
    return HelperFormat.getTimeFromMomentDuration(d);
  }

  private static async getLatestSuccessReportByDefinition(configName: string) {
    const params = {
      report_name: configName,
      // tslint:disable-next-line
      fields: [
        "id",
        "configName",
        "reportFailed",
        "createTime",
        "type",
        "description",
        "user"
      ],
      // latest: "on",
      success: "on"
    };

    // @ts-ignore
    const { data } = await api.getReportHistory({ params });

    if (
      data &&
      data._embedded &&
      data._embedded.reportHistoryFieldsViews.length > 0
    ) {
      const { reportHistoryFieldsViews } = data._embedded;
      return reportHistoryFieldsViews;
    }
    return [];
  }

  static deletePathFromFields(configDefinition: IDefinitionContent | StreamDataDef, pathToRemove) {
    if (configDefinition.columns) configDefinition.columns = configDefinition.columns.filter((el) => el.name !== pathToRemove);
    if (configDefinition.sorting) configDefinition.sorting = configDefinition.sorting.filter((el) => el.column.name !== pathToRemove);
    if (configDefinition.grouping) configDefinition.grouping = configDefinition.grouping.filter((el) => el.name !== pathToRemove);
    if (configDefinition.summary) configDefinition.summary = configDefinition.summary.filter((el) => el[0].name !== pathToRemove);
  }

  static updateAliasToNewName(configDefinition: IDefinitionContent | StreamDataDef, oldName, newName) {
    if (oldName === newName) return;

    const bean = "com.cyoda.core.reports.columns.ReportAliasColumn";
    if (configDefinition.columns) {
      configDefinition.columns.forEach((el) => {
        if (el["@bean"] === bean && el.name === oldName) el.name = newName;
      });
    }
    if (configDefinition.sorting) {
      configDefinition.sorting.forEach((el) => {
        if (el.column["@bean"] === bean && el.column.name == oldName) el.column.name = newName;
      });
    }

    if (configDefinition.grouping) {
      configDefinition.grouping.forEach((el) => {
        if (el["@bean"] === bean && el.name === oldName) el.name = newName;
      });
    }
    if (configDefinition.summary) {
      configDefinition.summary.forEach((el) => {
        if (el[0]["@bean"] === bean && el[0].name === oldName) el[0].name = newName;
      });
    }
  }
}
