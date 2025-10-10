import {XMLValidator, XMLParser, XMLBuilder} from "fast-xml-parser";

import prettyData from "./PrettyData";
import type {EntityMappingConfigDto, MappingConfigDto} from "../components/DataMapper/MappingConfigDto.d.ts";
import {parse} from "csv-parse/browser/esm/sync";
import {stringify} from "csv-stringify/browser/esm/sync";
import HelperMapper from "./HelperMapper";
import _ from "lodash";
import {ElMessage} from 'element-plus';
import {nextTick} from "vue";
import eventBus from "@cyoda/ui-lib/src/plugins/eventBus";

export default class HelperContent {
  static isJsonValid(str: string) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  static isXmlValid(str: string) {
    const result: any = XMLValidator.validate(str);
    return !result.err;
  }

  static isCsvValid(str: string) {
    return !!str;
  }

  static compactContent(str: string, dataMappingConfigDto: MappingConfigDto) {
    if (dataMappingConfigDto.dataType === "JSON") {
      return JSON.stringify(JSON.parse(str));
    } else if (dataMappingConfigDto.dataType === "XML") {
      return prettyData.xmlmin(str);
    } else {
      return str;
    }
  }

  static prettyContent(str: string, type = null) {
    if (!type) type = HelperContent.getFileType(str);
    if (type === "json") {
      return prettyData.json(str);
    }
    if (type === "xml") {
      return prettyData.xml(str);
    } else {
      return str;
    }
  }

  static getFileType(content: string): "json" | "xml" | "text" {
    if (HelperContent.isJsonValid(content)) {
      return "json";
    }
    if (HelperContent.isXmlValid(content)) {
      return "xml";
    } else {
      return "text";
    }
  }

  static getPlaceholdersFromString(query: string) {
    if (query) {
      const regexp = /\$\{([^:]*?)\}/g;
      const results = [...query.toString().matchAll(regexp)];
      return results.map((el) => el[1]);
    } else {
      return [];
    }
  }

  static getPlaceholdersFromSqlString(query: string) {
    if (query) {
      const regexp = /:([^\s]*)/g;
      const results = [...query.toString().matchAll(regexp)];
      return results.map((el) => el[1].toLowerCase());
    } else {
      return [];
    }
  }

  static getSourceData(sampleContent: string, dataMappingConfigDto: MappingConfigDto) {
    if (sampleContent.length > 0) {
      if (dataMappingConfigDto.dataType === "JSON" || dataMappingConfigDto.dataType === "BINARY_DOC" || this.isJsonValid(sampleContent)) {
        try {
          return JSON.parse(sampleContent);
        } catch {
          nextTick().then(() => {
            eventBus.$emit('restoreContent', sampleContent);
            setTimeout(() => {
              ElMessage.error('Something wrong in JSON file. Please, fix content manually');
            }, 500);
          })
          return {};
        }
      } else if (dataMappingConfigDto.dataType === "XML") {
        const parser = new XMLParser({
          attributeNamePrefix: "@",
          ignoreAttributes: false,
          removeNSPrefix: true,
          numberParseOptions: {
            leadingZeros: false,
            hex: false,
          }
        });
        const json = parser.parse(sampleContent);
        // HelperContent.transformJsonWithAttributesToCyodaFormat(json);
        // json=sortKeys(json,{deep:true});
        return json;
      } else if (dataMappingConfigDto.dataType === "CSV") {
        let jsonArr = this.parseCsv(dataMappingConfigDto);
        const newJsonArr: any[] = [];
        jsonArr.forEach((row) => {
          const newRow = {};
          Object.keys(row).forEach((oldKey, index) => {
            const newKey = dataMappingConfigDto.parserParameters.headers[index] || oldKey;
            newRow[newKey] = row[oldKey];
          });
          newJsonArr.push(newRow);
        });
        jsonArr = [];
        return newJsonArr;
      }
    }
    return {};
  }

  static buildXml(jObj) {
    const builder = new XMLBuilder({
      attributeNamePrefix: "@",
      ignoreAttributes: false,
    });
    return builder.build(jObj);
  }

  static parseXml(sampleContent) {
    const parser = new XMLParser({
      attributeNamePrefix: "@",
      ignoreAttributes: false,
      removeNSPrefix: true,
      numberParseOptions: {
        leadingZeros: false,
        hex: false,
      }
    });
    return parser.parse(sampleContent);
  }

  static restoreContent(obj: object, dataMappingConfigDto: MappingConfigDto) {
    if (dataMappingConfigDto.dataType === "CSV") {
      return dataMappingConfigDto.sampleContent;
    } else if (dataMappingConfigDto.dataType === "XML") {
      return HelperContent.buildXml(obj);
    }
    return obj;
  }

  static transformJsonWithAttributesToCyodaFormat(obj: any, parentObj: any = {}, parentKey = "") {
    Object.keys(obj).forEach((key) => {
      // Value
      if (key === "#text" && typeof obj[key] !== "object") {
        parentObj[parentKey] = obj[key];
      }

      if (typeof obj[key] === "object" && obj[key] !== null) {
        this.transformJsonWithAttributesToCyodaFormat(obj[key], obj, key);
      }
    });
    return obj;
  }

  static transformEnumToOption(data: string[]) {
    return data.map((el: string) => {
      const label = el.toLowerCase();
      return {
        value: el,
        label: label[0].toUpperCase() + label.substring(1),
      };
    });
  }

  static getAllErrorMessagesFromForm(errors = {}) {
    if (errors && Object.keys(errors).length > 0) {
      const data = [];
      Object.keys(errors).forEach((key) => {
        errors[key].forEach((value) => {
          data.push(value.message)
        })
      })
      return data;
    }
    return [];
  }

  static escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
  }

  static parseCsv(dataMappingConfigDto: MappingConfigDto, content = null) {
    return parse(content || dataMappingConfigDto.sampleContent, {
      columns: dataMappingConfigDto.parserParameters.withHeader,
      delimiter: dataMappingConfigDto.parserParameters.delimiter || ",",
      quote: dataMappingConfigDto.parserParameters.quoteChar || '"',
    });
  }

  static stringifyCsv(dataMappingConfigDto: MappingConfigDto, data) {
    return stringify(data, {
      header: dataMappingConfigDto.parserParameters.withHeader,
      delimiter: dataMappingConfigDto.parserParameters.delimiter || ",",
      quote: dataMappingConfigDto.parserParameters.quoteChar || '"',
    });
  }

  static getNotExistRelations(allDataRelations, sourceData, selectedEntityMapping: EntityMappingConfigDto, dataMappingConfigDto: MappingConfigDto, notExistPaths: string = []) {
    const listRelations = allDataRelations
      .filter((relation) => relation.type !== "functionalMappingInner")
      .filter((relation) => relation.type !== "cobiCoreMetadata")
      .filter((relation) => relation.column.jsonPath && relation.column.dstColumnPath && relation.column.srcColumnPath);


    // NotExist
    let listNotExist = listRelations.filter((el) => {
      let columnPath: any = "";
      if (dataMappingConfigDto.dataType === "CSV") {
        columnPath = el.column.jsonPath;
        return _.get(sourceData, ["0", columnPath]) === undefined;
      } else {
        columnPath = HelperMapper.transformPathToJsAsArray(`${HelperMapper.getFullPathForEntity(selectedEntityMapping, dataMappingConfigDto)}/${el.column.jsonPath}`);
        return _.get(sourceData, columnPath) === undefined;
      }
    });
    listNotExist = JSON.parse(JSON.stringify(listNotExist));
    listNotExist = listNotExist.map((el) => {
      return {
        isNotExistSrc: true,
        typeError: "notExist",
        reason: "Not exist relation",
        ...el,
      };
    });
    // End NotExist


    // NotExist JS Script Path
    let listNotExistJsScriptPaths: any = selectedEntityMapping.script.inputSrcPaths.filter((el) => {
      let columnPath: any = "";
      columnPath = HelperMapper.transformPathToJsAsArray(`${HelperMapper.getFullPathForEntity(selectedEntityMapping, dataMappingConfigDto)}/${el}`);
      return _.get(sourceData, columnPath) === undefined;
    });
    listNotExistJsScriptPaths = JSON.parse(JSON.stringify(listNotExistJsScriptPaths));
    listNotExistJsScriptPaths = listNotExistJsScriptPaths.map((el) => {
      return {
        isNotExistSrc: true,
        typeError: "notExistScriptPaths",
        reason: "Not exist script path",
        column: {
          dstColumnPath: '',
          jsonPath: el,
          srcColumnPath: el,
        }
      };
    });
    // End NotExist JS Script Path

    // NotExist DSTPATHS
    let listNotExistDstPaths = listRelations.filter((el) => {
      return notExistPaths.includes(el.column.dstColumnPath)
    });

    listNotExistDstPaths = JSON.parse(JSON.stringify(listNotExistDstPaths));
    listNotExistDstPaths = listNotExistDstPaths.map((el) => {
      return {
        isNotExistSrc: false,
        typeError: "notExist",
        reason: "Not exist relation",
        ...el,
      };
    });

    // End NotExist DSTPATHS

    let brokenDownRelations = listRelations.filter((el) => el.type === 'columnMapping').filter((el) => {
      const srcCountAsterisk = el.column.srcColumnPath.split("*").length;
      const dstCountAsterisk = el.column.dstColumnPath.split("*").length;
      return srcCountAsterisk !== dstCountAsterisk;
    })

    brokenDownRelations = JSON.parse(JSON.stringify(brokenDownRelations));
    brokenDownRelations = brokenDownRelations.map((el) => {
      return {
        isNotExistSrc: true,
        typeError: "numberStar",
        reason: "Number of * is not same in source and in target paths",
        ...el,
      };
    });

    return _.uniqBy([...listNotExist, ...brokenDownRelations, ...listNotExistDstPaths, ...listNotExistJsScriptPaths], item => `${item.column.jsonPath}_${item.column.dstColumnPath}`);
  }

  public static getDataMappingDataForConfirm(dataMappingConfigDto: MappingConfigDto) {
    const tmpData: MappingConfigDto = JSON.parse(JSON.stringify(dataMappingConfigDto));
    tmpData.entityMappings.forEach((entityMapping) => {
      delete entityMapping.id.uiId;
      entityMapping.functionalMappings.forEach((functionalMapping) => {
        if (functionalMapping.metaPaths && functionalMapping.metaPaths.length === 0) {
          delete functionalMapping.metaPaths;
        }
      })
    })
    return HelperContent.prettyContent(JSON.stringify(tmpData));
  }
}
