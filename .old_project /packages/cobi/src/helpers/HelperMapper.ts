import type {
  EntityMappingConfigDto,
  FunctionalMappingConfigDto,
  MappingConfigDto
} from "../components/DataMapper/MappingConfigDto.d.ts";
import _ from "lodash";
import HelperContent from "../helpers/HelperContent";
import HelperFilter from "@cyoda/ui-lib/src/components-library/patterns/FilterBuilder/HelperFilter";
import {getUid, setUid} from "./HelperEntityMappingConfigId";
import {JSONPath} from "jsonpath-plus";
import {nextTick} from "vue";

export default class HelperMapper {
  static COLOR_RELATION_COLUMN_MAPPING = "#67c23a";
  static COLOR_RELATION_FUNCTIONAL_MAPPING = "#E6A23C";
  static COLOR_RELATION_CORE_METADATA = "#409eff";
  static COLOR_RELATION_DEFAULT = "#858484";
  static COLOR_RELATION_NOT_EXIST = "#F56C6C";

  static isColumnHaveTransformError(column: any, listAllTransformers: any[]) {
    const finalType = column.dstCyodaColumnPathType;
    if (finalType === "[B" || (finalType == null && column.srcColumnPath === "content")) {
      return false;
    }
    if (column && column.transformer) {
      const children = column.transformer.children;
      if (!children || children.length == 0) {
        return true;
      } else {
        const children = column.transformer.children;
        const lastChildren = children[children.length - 1];
        const transformer = listAllTransformers.find((el) => el.transformerKey == lastChildren.transformerKey);
        if (transformer) {
          return transformer.outType !== finalType;
        }
      }
    }
    return false;
  }

  static isFunctionalMappingRelationHaveError(functionalMappingConfig: FunctionalMappingConfigDto) {
    return functionalMappingConfig.statements.length === 0;
  }

  static transformPathToJs(path: string) {
    return path
      .replaceAll("//", "/")
      .replaceAll("root:/", "")
      .replace(/(\/)?\*/g, "[0]")
      .replace(/\//g, ".")
      .replace(/\.+$/g, "");
  }

  static transformPathToJsAsArray(path: string) {
    return path
      .replace("//", "/")
      .replace("root:/", "")
      .replace(/(\/)?\*/g, "/0")
      .split("/")
      .filter((el) => el);
  }

  static getValueFromSourceData(sourceData: any, srcColumnPath: string, dataType: string) {
    const columnPath = HelperMapper.transformPathToJs(srcColumnPath);
    if (dataType === "XML") {
      const value = _.get(sourceData, columnPath);
      if (typeof value == "object") {
        return value["#text"];
      }
    }
    return _.get(sourceData, columnPath);
  }

  static curvedHorizontal(startX: any, startY: any, endX: any, endY: any) {
    // M
    const AX = startX;
    const AY = startY;

    // L
    const BX = Math.abs(endX - startX) * 0.05 + startX;
    const BY = startY;

    // C
    const CX = (endX - startX) * 0.66 + startX;
    const CY = startY;
    const DX = (endX - startX) * 0.33 + startX;
    const DY = endY;
    const EX = -Math.abs(endX - startX) * 0.05 + endX;
    const EY = endY;

    // L
    const FX = endX;
    const FY = endY;

    // setting up the path string
    let path = "M" + AX + "," + AY;
    path += " L" + BX + "," + BY;
    path += " " + "C" + CX + "," + CY;
    path += " " + DX + "," + DY;
    path += " " + EX + "," + EY;
    path += " L" + FX + "," + FY;

    // applying the new path to the element
    return path;
  }

  static curvedHorizontalSmall(startX: any, startY: any, endX: any, endY: any) {
    // M
    const AX = startX;
    const AY = startY;

    // L
    const BX = startX - 10;
    const BY = startY;

    // C
    const CX = startX - 10;
    const CY = startY;
    const DX = endX - 100;
    const DY = endY;
    const EX = Math.abs(endX - startX) * 0.05 + endX;
    const EY = endY;

    // L
    const FX = endX;
    const FY = endY;

    // setting up the path string
    let path = "M" + AX + "," + AY;
    path += " L" + BX + "," + BY;
    path += " " + "C" + CX + "," + CY;
    path += " " + DX + "," + DY;
    path += " " + EX + "," + EY;
    path += " L" + FX + "," + FY;

    // applying the new path to the element
    return path;

    // applying the new path to the element
    // return `M${startX} ${startY} C ${startX+100} ${startY+100}, ${endX/2} ${endY/2}, ${endX} ${endY}`;
  }

  static getFullPathForEntity(entityMapping: EntityMappingConfigDto, dataMappingConfigDto: MappingConfigDto): string {
    let path = entityMapping.entityRelationConfigs[0].srcRelativeRootPath;
    if (entityMapping.entityRelationConfigs[0].parentId) {
      const parentEntity = dataMappingConfigDto.entityMappings.find((el) => {
        return el.id.id === entityMapping.entityRelationConfigs[0].parentId.id || (el.id.uiId && el.id.uiId === entityMapping.entityRelationConfigs[0].parentId.uiId);
      });
      if (parentEntity) {
        path = `${HelperMapper.getFullPathForEntity(parentEntity, dataMappingConfigDto)}${path ? `/${path}` : ''}`;
      }
    }
    // @ts-ignore
    return path;
  }

  static getTypeOfData(value: any, rowKey = null, dataType = null) {
    if (dataType === "BINARY_DOC") {
      if (rowKey == "content") {
        return "binary";
      } else if (rowKey == "content-size") {
        return "number";
      }
    }
    if (Array.isArray(value)) {
      return "array";
    }
    if (value === null) {
      return "null";
    }
    return typeof value;
  }

  static isCanBeUploadedFile(dataType: string) {
    const listOfPossibleTypes = ["JSON", "XML", "CSV"];
    return listOfPossibleTypes.indexOf(dataType) != -1;
  }

  static mappingConfigDtoConvertToBackend(data: MappingConfigDto) {
    const dataConv: MappingConfigDto = JSON.parse(JSON.stringify(data));
    delete dataConv.virtual;

    const allDataRelations = HelperMapper.allDataRelations(dataConv);
    const entityMappingsMetaDatas: any[] = [];

    dataConv.entityMappings.forEach((entityMapping) => {
      const allDataRelationsCurrent = HelperMapper.getAllDataRelationsForSelectedEntity(allDataRelations, entityMapping);
      // Column Mapping
      entityMapping.columns.forEach((column) => {
        if (!Array.isArray(column.transformer.children)) column.transformer.children = [];

        const isNoTransform = column.transformer.children.find((el) => el.transformerKey.indexOf("NoTransform") > -1);
        if (column.transformer.children.length == 1 && isNoTransform) {
          // @ts-ignore
          column.dstCyodaColumnPathType = null;
          // @ts-ignore
          column.transformer = column.transformer.children[0];
        } else if (column.transformer.children.length > 0 && !("type" in column.transformer)) {
          // @ts-ignore
          column.transformer.type = "COMPOSITE";
        }
      });

      // Functional Mapping
      entityMappingsMetaDatas.push({
        uiId: entityMapping.id.uiId,
        cobiPathsRelations: allDataRelationsCurrent.map((el) => el.column),
        isShowNoneMappingFields: entityMapping.isShowNoneMappingFields,
        isPolymorphicList: entityMapping.isPolymorphicList,
      });

      // @ts-ignore
      delete entityMapping.cobiPathsRelations;

      // NoneMappingFields
      // @ts-ignore
      delete entityMapping.isShowNoneMappingFields;
      // @ts-ignore
      delete entityMapping.noneMappingFields;
      // @ts-ignore
      delete entityMapping.isPolymorphicList;

      // UiId
      if (entityMapping.id && entityMapping.id.id) entityMapping.id.uiId = null;
      entityMapping.entityRelationConfigs.forEach((el) => {
        if (el.parentId && el.parentId.id && el.parentId.uiId) el.parentId.uiId = null;
      });
    });

    entityMappingsMetaDatas.chatBotId = dataConv.chatBotId;
    delete dataConv.chatBotId;

    dataConv.metadata = JSON.stringify({
      entityMappingsMetaDatas,
    });
    return dataConv;
  }

  static mappingConfigDtoConvertToUi(data: MappingConfigDto, noneMappingFields: string[]) {
    const dataConv: MappingConfigDto = JSON.parse(JSON.stringify(data));
    const metaData = JSON.parse(data.metadata || "{}");
    const entityMappingsMetaDatas = metaData.entityMappingsMetaDatas || [];

    // Disabled for chatbot. May be temporary
    // if (!metaData.chaBotId) {
    //   metaData.chatBotId = uuidv4();
    // }
    //
    // dataConv.chatBotId = dataConv.id || metaData.chatBotId;

    // Set uiId
    dataConv.entityMappings.forEach((entityMapping, index) => {
      if (!entityMapping.id.uiId) entityMapping.id.uiId = index + 1;

      // Add script
      if (!entityMapping.script) {
        entityMapping.script = {
          inputSrcPaths: [],
          inputMetaPaths: [],
          reusableScripts: [],
          body: "",
        }
      }
    });

    const allDataRelations = HelperMapper.allDataRelations(dataConv).filter((el) => el.type !== "functionalMappingInner");

    // Main
    dataConv.entityMappings.forEach((entityMapping, index) => {
      const allDataRelationsCurrent = HelperMapper.getAllDataRelationsForSelectedEntity(allDataRelations, entityMapping);

      // Column Mapping
      entityMapping.columns.forEach((column) => {
        // @ts-ignore
        if (column.transformer.transformerKey && column.transformer.transformerKey.indexOf("NoTransform") > -1) {
          // @ts-ignore
          column.transformer = {
            type: "COMPOSITE",
            // @ts-ignore
            children: [column.transformer],
          };
        }
      });

      if (!entityMapping.cobiPathsRelations) entityMapping.cobiPathsRelations = [];

      // Functional Mapping
      let entityMappingsMetaData: any = {};
      if (entityMappingsMetaDatas.length > 0) {
        entityMappingsMetaData = entityMappingsMetaDatas[index];
      }

      // Cobi Paths for Relations
      if (entityMappingsMetaData.cobiPathsRelations) {
        entityMapping.cobiPathsRelations = entityMappingsMetaData.cobiPathsRelations;
      } else if (!entityMappingsMetaData.cobiPathsRelations && allDataRelationsCurrent.length > 0) {
        const cobiPathsRelations: any[] = [];
        for (const el of allDataRelationsCurrent) {
          cobiPathsRelations.push({
            jsonPath: el.column.srcColumnPath.replaceAll("*", "0"),
            srcColumnPath: el.column.srcColumnPath,
            dstColumnPath: el.column.dstColumnPath,
          });
        }

        entityMapping.cobiPathsRelations = cobiPathsRelations;
      }

      if (entityMapping.functionalMappings && entityMapping.functionalMappings.length > 0) {
        const listToDelete: any[] = [];
        entityMapping.functionalMappings.forEach((functionalMapping) => {
          if (functionalMapping.srcPaths.length === 0 && functionalMapping.statements.length === 0) {
            listToDelete.push(functionalMapping);
          }

          if (!functionalMapping.metaPaths) {
            functionalMapping.metaPaths = [];
          }
        });
        if (listToDelete.length > 0) {
          listToDelete.forEach((functionalMapping) => {
            entityMapping.functionalMappings = entityMapping.functionalMappings.filter((el) => el !== functionalMapping);
          });
        }
      }

      // Cobi Core Metadata
      if (!entityMapping.cobiCoreMetadata) {
        entityMapping.cobiCoreMetadata = [];
      }

      if (!entityMapping.functionalMappings) {
        entityMapping.functionalMappings = [];
      }

      // Filters
      if (!("entityFilter" in entityMapping)) {
        const data = HelperFilter.getGroup();
        data.conditions = [];
        // @ts-ignore
        entityMapping.entityFilter = data;
      }

      // Add uiId
      entityMapping.entityRelationConfigs.forEach((el) => {
        const entityMappingSelected = dataConv.entityMappings.find((entityMappingInner) => el.parentId && entityMappingInner.id.id === el.parentId.id);
        if (entityMappingSelected) {
          el.parentId.uiId = entityMappingSelected.id.uiId;
          if (!el.hasOwnProperty('srcRelativeRootPath')) el.srcRelativeRootPath = null;
          if (!el.hasOwnProperty('currentEntityIdPath')) el.currentEntityIdPath = null;
          if (!el.hasOwnProperty('parentEntityIdPath')) el.parentEntityIdPath = null;
        }
      });

      if ("isShowNoneMappingFields" in entityMappingsMetaData) {
        entityMapping.isShowNoneMappingFields = entityMappingsMetaData.isShowNoneMappingFields;
      } else {
        entityMapping.isShowNoneMappingFields = HelperMapper.checkNoneMappingFields(entityMapping, noneMappingFields);
      }

      entityMapping.isPolymorphicList = !!entityMappingsMetaData.isPolymorphicList;
    });
    return dataConv;
  }

  static convertMapperToPolymorphicList(entityMapping: EntityMappingConfigDto, dataMappingConfigDto: MappingConfigDto) {
    const allDataRelations = HelperMapper.allDataRelations(dataMappingConfigDto).filter((el) => el.type !== "functionalMappingInner");
    const allDataRelationsCurrent = HelperMapper.getAllDataRelationsForSelectedEntity(allDataRelations, entityMapping);

    const fullPathToEntity = HelperMapper.getFullPathForEntity(entityMapping, dataMappingConfigDto);

    const cobiPathsRelations: any[] = [];
    for (const el of allDataRelationsCurrent) {
      const existPaths = HelperMapper.getJsonPathByCyodaPath(HelperContent.getSourceData(dataMappingConfigDto.sampleContent, dataMappingConfigDto), fullPathToEntity, el.column.srcColumnPath);
      let jsonPath = null;
      for (const existPath of existPaths) {
        const isExist: any = cobiPathsRelations.find((elCr: any) => elCr.jsonPath === existPath);
        const reg = new RegExp("(\\*|\\d{1,})/", "ig");
        if (isExist && reg.test(isExist.jsonPath)) {
          const matchesExist = isExist.srcColumnPath.match(reg);
          const matchesNew = el.column.srcColumnPath.match(reg);
          const diff = _.difference(matchesExist, matchesNew);
          if (diff.length > 0) continue;
        }
        jsonPath = existPath;
        break;
      }

      cobiPathsRelations.push({
        jsonPath,
        srcColumnPath: el.column.srcColumnPath,
        dstColumnPath: el.column.dstColumnPath,
      });
    }

    return cobiPathsRelations;
  }

  static checkNoneMappingFields(entityMapping, noneMappingFields) {
    const columnsWithNoneMappingFields = entityMapping.columns.filter((el) => noneMappingFields.includes(el.dstCyodaColumnPath));
    const functionalMappingsWithNoneMappingFields = entityMapping.functionalMappings.filter((el) => noneMappingFields.includes(el.dstPath));
    return [...columnsWithNoneMappingFields, ...functionalMappingsWithNoneMappingFields].length > 0;
  }

  static getScrollParent(node) {
    if (node == null) {
      return null;
    }

    if (node.scrollHeight > node.clientHeight) {
      return node;
    } else {
      return HelperMapper.getScrollParent(node.parentNode);
    }
  }

  // static addMissingFieldsToAllObjects(data) {
  //   const dataTmp = JSON.parse(JSON.stringify(data));
  //   if (Array.isArray(dataTmp) && typeof dataTmp[0] === "object") {
  //     const firstElementObject = {};
  //     dataTmp.forEach((el) => {
  //       Object.keys(el).forEach((key) => {
  //         if (!(key in firstElementObject)) {
  //           firstElementObject[key] = el[key];
  //         }
  //       });
  //     });
  //     dataTmp[0] = firstElementObject;
  //   }
  //   return dataTmp;
  // }

  static addMissingFieldsToAllObjects(content) {
    if (Array.isArray(content) && content.every((el) => typeof el === "object")) {
      const firstEl = content.shift();
      content = [_.mergeWith(firstEl, ...content, (a, b) => {
        if (!b) {
          return a;
        }
        if(Array.isArray(a) && typeof b === 'string' ){
          return [b];
        }
        return undefined;
      }), ...content];
    } else if (content && typeof content === "object") {
      Object.keys(content).forEach((key) => {
        content[key] = HelperMapper.addMissingFieldsToAllObjects(content[key]);
      });
    }
    return content;
  }

  static relativePathOptions(data: any, parentPath = "", children = [], isShowAll = false) {
    const isArray = Array.isArray(data);
    Object.keys(data).forEach((key, index) => {
      if (isArray && index > 0) {
        return;
      }
      if (!isShowAll && typeof data[key] !== "object" && !isArray) {
        return;
      }
      const label = isArray ? "*" : key;
      const path = `${parentPath}${label}`;
      const item: any = {
        label: path,
        labelShort: label,
        value: path,
        // isDisabled: !isArray
      };
      if (typeof data[key] === "object" && data[key] !== null) {
        item.children = [];
        HelperMapper.relativePathOptions(data[key], `${path}/`, item.children, isShowAll);
        if (item.children && item.children.length == 0) {
          delete item.children;
        }
      }
      // @ts-ignore
      children.push(item);
    });
    return children;
  }

  // For Remove
  static transformDataForSeveralSrcRelativeRootPath(entityMapping: EntityMappingConfigDto, dataMappingConfigDto: MappingConfigDto, content: any) {
    if (entityMapping.entityRelationConfigs.length <= 1) return content;

    const getPath = (entityMapping, dataMappingConfigDto, el) => {
      const fullPathForEntity = HelperMapper.getFullPathForEntity(entityMapping, dataMappingConfigDto);
      const elSrcPath = el.srcRelativeRootPath;
      let path = "";
      if (elSrcPath.includes("root:/")) {
        path = elSrcPath;
      } else {
        path = fullPathForEntity + "/" + elSrcPath;
      }
      return HelperMapper.transformPathToJs(path);
    };

    const dataTmp = entityMapping.entityRelationConfigs.map((el) => {
      const path = getPath(entityMapping, dataMappingConfigDto, el);
      return _.get(content, path);
    });

    const newObject = _.merge(dataTmp[0], ...dataTmp);

    entityMapping.entityRelationConfigs.forEach((el) => {
      const path = getPath(entityMapping, dataMappingConfigDto, el);
      content = _.set(content, path, newObject);
    });

    return content;
  }

  // static updateOldToNewFieldsInObj(obj, oldValues, newValues) {
  //   if (Array.isArray(obj)) {
  //     for (const el of obj) {
  //       HelperMapper.updateOldToNewFieldsInObj(el, oldValues, newValues);
  //     }
  //   } else if (typeof obj === "object") {
  //     for (const key of Object.keys(obj)) {
  //       if (typeof obj[key] === "string" && oldValues.indexOf(obj[key]) > -1) {
  //         const index = oldValues.indexOf(obj[key]);
  //         obj[key] = newValues[index];
  //       } else if (typeof obj[key] === "object") {
  //         HelperMapper.updateOldToNewFieldsInObj(obj[key], oldValues, newValues);
  //       }
  //     }
  //   }
  // }

  // static updateOldToNewFieldsInObj2(obj, oldValues, newValues, ignoreFields=[]) {
  //   ignoreFields.push('jsonPath');
  //   let objString = JSON.stringify(obj);
  //   ignoreFields.forEach((el) => {
  //     objString = objString.replaceAll(`"${el}":"`, `"${el}":"_`);
  //   })
  //
  //   objString = objString.replaceAll('":', '_":');
  //
  //   oldValues.forEach((el, index) => {
  //     objString = objString.replaceAll(`"${el}"`, `"${newValues[index]}"`);
  //   });
  //
  //   objString = objString.replaceAll('_":', '":');
  //   ignoreFields.forEach((el) => {
  //     objString = objString.replaceAll(`"${el}":"_`, `"${el}":"`);
  //   })
  //   Object.assign(obj, JSON.parse(objString));
  // }

  static updateOldToNewFieldsInObj(obj, oldValues, newValues, ignoreFields = ['jsonPath']) {
    for (const key of Object.keys(obj)) {
      if (ignoreFields.includes(key) || !obj[key]) continue;
      if (typeof obj[key] === 'object') {
        HelperMapper.updateOldToNewFieldsInObj(obj[key], oldValues, newValues, ignoreFields)
      } else {
        const indexEl = oldValues.indexOf(obj[key]);
        if (indexEl === -1) continue;
        obj[key] = newValues[indexEl];
      }
    }
  }

  static updateOldJsonPathsToNewFieldsInObj(obj, oldValues, newValues) {
    HelperMapper.updateOldToNewFieldsInObj(obj, oldValues, newValues, ['dstColumnPath', 'srcColumnPath']);
  }

  // static updateOldJsonPathsToNewFieldsInObj(obj, oldValues, newValues) {
  //   let objString = JSON.stringify(obj);
  //   objString = objString.replaceAll('"dstColumnPath":"', '"dstColumnPath":"_');
  //   objString = objString.replaceAll('"srcColumnPath":"', '"srcColumnPath":"_');
  //   oldValues.forEach((el, index) => {
  //     objString = objString.replaceAll(`"${el}"`, `"${newValues[index]}"`);
  //   });
  //   objString = objString.replaceAll('"dstColumnPath":"_', '"dstColumnPath":"');
  //   objString = objString.replaceAll('"srcColumnPath":"_', '"srcColumnPath":"');
  //   Object.assign(obj, JSON.parse(objString));
  // }

  static clearEntityMapping(entityMapping: EntityMappingConfigDto) {
    entityMapping.columns = [];
    entityMapping.functionalMappings = [];
    entityMapping.columnPathsForUniqueCheck = [];
  }

  static checkIfPathNotExist(allSelectedRelations: any[], notExistRelations: any[]) {
    if (notExistRelations.length === 0) return false;

    const allExistPaths = allSelectedRelations.map((el) => el.column.jsonPath);
    return !!notExistRelations.find((el: any) => {
      return allExistPaths.includes(el.column.jsonPath);
    });
  }

  static allDataRelations(dataMappingConfigDto: MappingConfigDto, activeRelation: any = null) {
    const data: any[] = [];
    dataMappingConfigDto.entityMappings.forEach((entityMapping: any) => {
      const entityClass = entityMapping.entityClass;
      entityMapping.columns
        .filter((column) => {
          if (!(this as any).reassignRelation) return true;
          if ((this as any).reassignRelation.direction === "fromTarget") {
            return column.srcColumnPath !== (this as any).reassignRelation.column.srcColumnPath;
          } else {
            return column.dstCyodaColumnPath !== (this as any).reassignRelation.column.dstColumnPath;
          }
        })
        .forEach((column: any) => {
          data.push({
            entityClass: entityClass,
            id: entityMapping.id,
            column: {
              srcColumnPath: column.srcColumnPath,
              dstColumnPath: column.dstCyodaColumnPath,
              jsonPath: HelperMapper.getJsonPathForEntityMapping(entityMapping, column.srcColumnPath, column.dstCyodaColumnPath),
            },
            type: "columnMapping",
          });
        });

      if (entityMapping.functionalMappings) {
        entityMapping.functionalMappings.forEach((el) => {
          el.srcPaths.forEach((srcPath) => {
            data.push({
              entityClass: entityClass,
              id: entityMapping.id,
              column: {
                srcColumnPath: srcPath,
                dstColumnPath: el.dstPath,
                jsonPath: HelperMapper.getJsonPathForEntityMapping(entityMapping, srcPath, el.dstPath),
              },
              type: "functionalMapping",
            });
          });

          el.statements.forEach((statement) => {
            if (statement.type === "SET_DST_VALUE") {
              data.push({
                entityClass: entityClass,
                id: entityMapping.id,
                column: {
                  srcColumnPath: el.dstPath,
                  dstColumnPath: statement.dstPath,
                  jsonPath: el.dstPath,
                },
                type: "functionalMappingInner",
              });
            }
          });
        });
      }

      if (entityMapping.cobiCoreMetadata) {
        entityMapping.cobiCoreMetadata.forEach((column: any) => {
          data.push({
            entityClass: entityClass,
            id: entityMapping.id,
            column: {
              srcColumnPath: column.name,
              jsonPath: column.name,
              dstColumnPath: column.dstCyodaColumnPath,
            },
            type: "cobiCoreMetadata",
          });
        });
      }

      if (entityMapping.script.inputSrcPaths) {
        entityMapping.script.inputSrcPaths.forEach((el: any) => {
          data.push({
            entityClass: entityClass,
            id: entityMapping.id,
            column: {
              srcColumnPath: el,
              jsonPath: HelperMapper.getJsonPathForEntityMapping(entityMapping, el, ""),
              dstColumnPath: '',
            },
            type: "cobiJsPaths",
          });
        });
      }

      if (activeRelation && !activeRelation.notExistRelation) {
        data.push({
          entityClass: entityClass,
          id: entityMapping.id,
          column: activeRelation.column,
          type: activeRelation.type,
        });
      }
    });
    return data;
  }

  static getJsonPathForEntityMapping(entityMapping: EntityMappingConfigDto, srcColumnPath: string, dstColumnPath: string) {
    if (!entityMapping.cobiPathsRelations) entityMapping.cobiPathsRelations = [];
    let relation = entityMapping.cobiPathsRelations.find((el) => el.srcColumnPath === srcColumnPath && el.dstColumnPath === dstColumnPath);
    if (!relation) {
      relation = {
        jsonPath: srcColumnPath.replaceAll("*", "0"),
        srcColumnPath: srcColumnPath,
        dstColumnPath: dstColumnPath,
      }
      entityMapping.cobiPathsRelations.push(relation);
    } else if (relation && !relation.jsonPath) {
      relation.jsonPath = relation.srcColumnPath.replaceAll("*", "0");
    }
    return (relation && relation.jsonPath) || "";
  }

  static getJsonPathByCyodaPath(sourceData: any, fullPathToEntity: string, path: string) {
    fullPathToEntity = fullPathToEntity.replace("root:/", "");
    const newPath = `$.${fullPathToEntity}/${path}`.replaceAll("//", "/").replaceAll("/", ".").replaceAll("..", ".").replaceAll("@", "`@");
    // @ts-ignore
    try {
      const results = JSONPath({resultType: "pointer", path: newPath, json: sourceData});
      return results.map((el) => {
        if (fullPathToEntity) {
          const fullPathToEntityReplace = (fullPathToEntity.replace(/\/+$/, "").replace("*", "[^/]*") + "/").replaceAll("/", "\\/");
          el = el.replaceAll(new RegExp(fullPathToEntityReplace, "g"), "");
        }
        el = el.replace(/^\/+/, "");

        return el;
      });
    } catch (e) {
      console.log(e);
      return [];
    }
  }

  static getAllDataRelationsForSelectedEntity(allDataRelations, selectedEntityMapping) {
    return allDataRelations.filter((el) => el.id.uiId === selectedEntityMapping.id.uiId);
  }

  static computePathByKey(key: string, path: string, parentTypeOfData, dataType) {
    let parentPath = path ? `${path}/` : "";
    if (dataType === "XML") {
      if (key === "#text") {
        key = "";
        parentPath = parentPath.replace(/\/$/, "");
      }
    }

    return `${parentPath}${key}`;
  }

  static changeIsPolymorphicList(entityMapping: EntityMappingConfigDto, dataMappingConfigDto: MappingConfigDto) {
    if (entityMapping.isPolymorphicList) {
      entityMapping.cobiPathsRelations = HelperMapper.convertMapperToPolymorphicList(entityMapping, dataMappingConfigDto);
    } else if (entityMapping.cobiPathsRelations.length > 0) {
      const mapUniqueDataExist = {};
      const mapUniqueDataNotExist = {};
      entityMapping.cobiPathsRelations.forEach((el) => {
        const path = el.srcColumnPath.replaceAll(/(\*|\d+)/g, "0");
        if (!mapUniqueDataExist[path]) {
          mapUniqueDataExist[path] = el.jsonPath;
        } else {
          mapUniqueDataNotExist[path] = el.jsonPath;
        }
        if (path !== el.srcColumnPath) {
          HelperMapper.updateOldToNewFieldsInObj(entityMapping, [el.srcColumnPath], [mapUniqueDataExist[path]]);
        }
      });
      entityMapping.cobiPathsRelations = entityMapping.cobiPathsRelations.map((el) => {
        const path = el.srcColumnPath.replaceAll(/(\*|\d+)/g, "0");
        if (mapUniqueDataNotExist[path]) {
          el.jsonPath = mapUniqueDataExist[path];
        }
        return el;
      });
    }
  }

  static clearAutoGeneratedFields(statements) {
    statements.forEach((statement) => {
      if (["ASSIGN_VAR", "RETURN"].includes(statement.type) && statement.dstPath) {
        delete statement.dstPath;
      }
    })
    return statements;
  }

  static removeFromScripts(selectedEntityMapping, {pathComputedSrcPath}) {
    const inputSrcPaths = selectedEntityMapping.script.inputSrcPaths
    selectedEntityMapping.script.inputSrcPaths = inputSrcPaths.filter((el) => el !== pathComputedSrcPath);
  }

  static addToScripts(selectedEntityMapping, {pathComputedSrcPath, jsonPathComputedSrcPath}) {
    const inputSrcPaths = selectedEntityMapping.script.inputSrcPaths;
    inputSrcPaths.push(pathComputedSrcPath);

    const isExistCobiPathsRelation = selectedEntityMapping.cobiPathsRelations.find((el) => {
      return el.srcColumnPath === pathComputedSrcPath;
    });

    if (!isExistCobiPathsRelation) {
      selectedEntityMapping.cobiPathsRelations.push({
        jsonPath: pathComputedSrcPath,
        srcColumnPath: jsonPathComputedSrcPath,
        dstColumnPath: "",
      });
    }
  }


  static async toggleToScript(sourceDataRef, toAdd) {
    await HelperMapper.walkToChild(sourceDataRef, 'openHandler', true);
    await HelperMapper.walkToChild(sourceDataRef, 'scriptsHandler', toAdd);
    await HelperMapper.walkToChild(sourceDataRef, 'isShowSourceDataHandler', true);
  }

  static isAllToScriptExists(selectedEntityMapping, dataForToggleJs) {
    const allChildPaths = dataForToggleJs.map(el => el.pathComputedSrcPath);
    const inputSrcPaths = selectedEntityMapping.script.inputSrcPaths;
    return allChildPaths.every((el) => inputSrcPaths.includes(el));
  }


  static async walkToChild(sourceDataRef, functionFn, param) {
    if (!Array.isArray(sourceDataRef.sourceDataRowRef)) return;
    for (const el of sourceDataRef.sourceDataRowRef) {
      if (el[functionFn]) await el[functionFn](param);
      if (el.sourceDataRef) {
        await nextTick();
        await HelperMapper.walkToChild(el.sourceDataRef, functionFn, param);
      }
    }
  }
}
