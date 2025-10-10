import qs, {IStringifyOptions} from 'qs';
import axios from "@cyoda/ui-lib/src/plugins/axios";

import {
    AliasDef,
    Cache,
    CatalogItem,
    CatalogItemExportImportContainer,
    ClusterState,
    Entity,
    EntityRequest,
    IDefinition,
    IDefinitionContent,
    IDefinitionContentConditionGroup,
    IDefinitionContentStream,
    IDefinitionContentStreamRequest,
    IDefinitionContentStreamResult,
    IDefinitionStream,
    IndexConfiguration,
    IReportStats,
    NodeInfo,
    RelatedPath,
    ReportColumn,
    ReportDefinition,
    ReportGroup,
    ReportHistory,
    ReportingReportStatus,
    ReportingTypes,
    ReportMapper,
    ServerInfo,
    ShardsDistr,
    StreamDefinitionsIndex,
    Transaction,
    TransactionDiff,
    User,
    VersionClient,
    VersionPlatform
} from '../types/types';
import HelperStorage from '../helpers/HelperStorage';
import HelperFeatureFlags from "../helpers/HelperFeatureFlags";

const helperStorage = new HelperStorage();

function currentUserName() {
    const auth = helperStorage.get('auth');
    if (auth && auth.username && auth.username) {
        return helperStorage.get('auth').username;
    }
    return '';
}

const strigifyOpts: IStringifyOptions = {
    addQueryPrefix: true,
    arrayFormat: 'comma',
    encode: false, // disable URI encodes output for comma separated arrays
    encodeValuesOnly: true,
    skipNulls: true,
};

export const urlListMap: {
    [index: string]: (id?: string, gid?: string) => string
} = {
    REPORT_HISTORY: (username = currentUserName()) => `platform-api/history?username=${encodeURIComponent(username)}&fields=id,configName,reportFailed,finishTime`,
    REPORT_STATUS: (reportId) => `platform-api/report/${reportId}/status`,
    REPORT_CONFIG: (reportId) => `platform-api/report/${reportId}/config`,
    REPORT_STATISTICS: (reportId) => `platform-api/report/${reportId}/stats?full=false`,
    REPORT_GROUPS: (reportId) => `platform-api/report/${reportId}/groups`,
    REPORT_GROUP: (reportId, groupId) => `platform-api/report/${reportId}/groups/${groupId}`,
    RUN_REPORT_FROM_PREDEFINED_CONFIG: (gridConfig) => `/platform-api/pre?gridConfig=${gridConfig}`,
    GET_REPORT_CONFIGS: () => `/platform-api/definitions?fields=description`,
};

export interface IGetReportTypesArgs {
    pageUrl?: string;
    params: IGetReportTypesQueryParams;
}

export interface IGetReportTypesQueryParams {
    size?: number;
}

export function getReportTypes(args: IGetReportTypesArgs) {
    if (args.pageUrl) {
        return axios.get(args.pageUrl);
    }

    args.params = {
        size: args.params.size,
    };

    const query = qs.stringify(args.params, strigifyOpts);

    return axios.get<ReportingTypes>(`/platform-api/reporting/types${query}`);
}

export interface IGetHistoryArgs {
    pageUrl?: string;
    params: IGetHistoryQueryParams;
}

export interface IGetHistoryQueryParams {
    username?: string | null;
    from?: string | null;
    to?: string | null;
    report_name?: string;
    // tslint:disable-next-line
    fields?: Array<('id' | 'configName' | 'reportFailed' | 'createTime' | 'finishTime' | 'type' | 'status' | 'description' | 'gridConfigId' | 'userId' | 'pointTime' | 'config' | 'rowsCountForFinishedShards' | 'totalRowsCount' | 'regroupingPossible' | 'reportFailedShards')>;
    // tslint:disable-next-line
    sorting?: Array<('id' | 'configName' | 'reportFailed' | 'createTime' | 'finishTime' | 'type' | 'status' | 'description' | 'gridConfigId' | 'userId' | 'pointTime' | 'config' | 'rowsCountForFinishedShards' | 'totalRowsCount' | '-id' | '-configName' | '-reportFailed' | '-createTime' | '-finishTime' | '-type' | '-status' | '-description' | '-gridConfigId' | '-user' | '-pointTime' | '-config' | '-rowsCountForFinishedShards' | '-totalRowsCount')>;
    filterByType?: string[] | null;
    latest?: OnOffNull;
    running?: OnOffNull;
    finished?: OnOffNull;
    success?: OnOffNull;
    failed?: OnOffNull;
    canceled?: OnOffNull;
    size?: number;
}

export type OnOffNull = 'on' | 'off' | null;


export function getReportHistory(args: IGetHistoryArgs) {
    if (args.pageUrl) {
        return axios.get<ReportHistory>(args.pageUrl);
    }

    args.params = {
        username: args.params.username && encodeURIComponent(args.params.username),
        from: args.params.from,
        to: args.params.to,
        report_name: args.params.report_name && encodeURIComponent(args.params.report_name),
        fields: args.params.fields,
        sorting: args.params.sorting,
        filterByType: args.params.filterByType,
        latest: args.params.latest,
        running: args.params.running,
        finished: args.params.finished,
        success: args.params.success,
        failed: args.params.failed,
        canceled: args.params.canceled,
        size: args.params.size,
    };

    const query = qs.stringify(args.params, strigifyOpts);

    return axios.get<ReportHistory>(`/platform-api/reporting/history${query}`);
}

export interface IGetDefinitionsArgs {
    pageUrl?: string;
    params: IGetDefinitionsQueryParams;
}

export interface IGetDefinitionsQueryParams {
    username?: string;
    fields?: Array<('id' | 'description' | 'type' | 'userId' | 'creationDate')>;
    size?: number;
}


export function getDefinitions(args: IGetDefinitionsArgs) {
    if (args.pageUrl) {
        return axios.get<ReportDefinition>(args.pageUrl);
    }

    args.params = {
        username: args.params.username && encodeURIComponent(args.params.username),
        fields: args.params.fields,
        size: args.params.size,
    };

    const query = qs.stringify(args.params, strigifyOpts);

    return axios.get<ReportDefinition>(`/platform-api/reporting/definitions${query}`);
}

export function getExportReportsByIds(ids: string[]) {
    return axios.get<ReportDefinition>(`/platform-api/reporting/export-by-ids?includeIds=${ids.join(',')}`);
}

export function postImportAllReports(data: any, params = {}) {
    return axios.post(`/platform-api/reporting/import`, data, {
        // @ts-ignore
        muteErrors: true,
        params
    });
}

export function getExportReportsStreamByIds(ids: string[]) {
    return axios.get<ReportDefinition>(`/platform-api/stream-data/export-by-ids?includeIds=${ids.join(',')}`);
}

export function postImportAllReportsStream(data: any, params = {}) {
    // @ts-ignore
    return axios.post(`/platform-api/stream-data/import`, data, {
        // @ts-ignore
        muteErrors: true,
        params
    });
}

export function getStreamDefinitions() {
    return axios.get<IDefinitionStream[]>(`/platform-api/stream-data/config/list`);
}

export interface IGetDefinitionArgs {
    pageUrl?: string;
    params?: IGetDefinitionQueryParams;
    path: IGetDefinitionPathParams;
}

// tslint:disable-next-line
export interface IGetDefinitionQueryParams {
}

export interface IGetDefinitionPathParams {
    definition: string;
}

export function getDefinition(args: IGetDefinitionArgs) {
    if (args.pageUrl) {
        return axios.get(args.pageUrl);
    }

    args.params = {};

    const query = qs.stringify(args.params, strigifyOpts);

    return axios.get<IDefinition>(`/platform-api/reporting/definitions/${encodeURIComponent(args.path.definition)}${query}`);
}

export function getStreamDefinition(configId: string) {
    return axios.get<IDefinitionStream>(`/platform-api/stream-data/config?configId=${configId}`);
}

export function updateDefinitions(id: string, content: IDefinitionContent, params = {}) {
    return axios.put(`/platform-api/reporting/definitions/${encodeURIComponent(id)}`, content, params);
}

export function updateStreamDefinitions(id: string, content: IDefinitionContentStream) {
    return axios.put(`/platform-api/stream-data/config?configId=${encodeURIComponent(id)}`, content);
}

export function deleteStreamDefinitions(id: string) {
    return axios.delete(`/platform-api/stream-data/config?configId=${id}`);
}

export function getStreamDefinitionsIndex(entityClass: string) {
    return axios.get<StreamDefinitionsIndex[]>(`/platform-api/stream-data/index/list?entityClass=${entityClass}`);
}

export function createDefinitions(name: string, content: IDefinitionContent) {
    return axios.post(`/platform-api/reporting/definitions?name=${encodeURIComponent(name)}`, content);
}

export function createStreamDefinitions(content: IDefinitionStream) {
    return axios.post(`/platform-api/stream-data/config`, content);
}

export function getReportingRunning() {
    return axios.get(`/platform-api/reporting/running`);
}

export function checkStatus(url: string) {
    return axios.get<ReportingReportStatus>(url, {
        validateStatus(status) {
            return status >= 200 && status < 500;
        },
    });
}

export function getStats(id: string, groupingVersion: string) {
    return axios.get<IReportStats>(`/platform-api/reporting/report/${id}/${groupingVersion}/stats?full=false`);
}

export function getConfig(id: string) {
    return axios.get<IDefinition>(`/platform-api/reporting/report/${id}/config`);
}

export function getReportRegroup(id: string, data: {
                                     hierarhyEnable: boolean,
                                     newGrouping: ReportColumn[]
                                 }
) {
    return axios.post(`/platform-api/reporting/report/regroup/${id}`, data);
}

export interface IRunReportPreConfigArgs {
    pageUrl?: string;
    params: IRunReportPreConfigQueryParams;
}

export interface IRunReportPreConfigQueryParams {
    gridConfig?: string;
    size?: number;
}


export function RunReportPreConfig(args: IRunReportPreConfigArgs) {
    if (args.pageUrl) {
        return axios.post(args.pageUrl);
    }

    args.params = {
        gridConfig: encodeURIComponent(args.params.gridConfig!),
        size: args.params.size,
    };

    const query = qs.stringify(args.params, strigifyOpts);

    return axios.post(`/platform-api/reporting/pre${query}`);
}

export interface ICancelProcessingReportArgs {
    pageUrl?: string;
    params?: ICancelProcessingReportQueryParams;
    path: ICancelProcessingReportPathParams;
}

// tslint:disable-next-line
export interface ICancelProcessingReportQueryParams {
}

export interface ICancelProcessingReportPathParams {
    report: string;
}

export function cancelProcessingReport(id: string, groupingVersion: string) {
    return axios.delete(`/platform-api/reporting/report/${id}/${groupingVersion}`);
}

export function deleteProcessingReport(id: string, mode: DeleteModeReport = "") {
    let url = `/platform-api/reporting/definitions/${encodeURIComponent(id)}`;
    if (mode) url += `?mode=${mode}`
    return axios.delete(url, {
        muteErrors: true
    });
}

export type DeleteModeReport = "cascade" | "reports" | "";


export interface IGetGroupsArgs {
    pageUrl?: string;
    params: IGetGroupsQueryParams;
    path: IGetGroupsPathParams;
}

// tslint:disable-next-line
export interface IGetGroupsQueryParams {
    page?: number;
    size?: number;
}

export interface IGetGroupsPathParams {
    reportId: string;
    groupingVersion: string;
}

export function getGroups(args: IGetGroupsArgs) {
    if (args.pageUrl) {
        return axios.get<ReportGroup>(args.pageUrl);
    }

    args.params = {
        page: args.params.page,
        size: args.params.size,
    };

    const query = qs.stringify(args.params, strigifyOpts);

    return axios.get<ReportGroup>(`/platform-api/reporting/report/${args.path.reportId}/${args.path.groupingVersion}/groups${query}`);
}

export function getGroupsHierarhy(definitionId: string, params: any) {
    return axios.get<ReportGroup>(`${params.parentNode.data._link}?size=40&page=${(params.request.endRow / 40) - 1}`);
}

export interface IGetGroupRowsArgs {
    pageUrl?: string;
    params: IGetGroupRowsQueryParams;
    path: IGetGroupRowsPathParams;
}

// tslint:disable-next-line
export interface IGetGroupRowsQueryParams {
    page?: number;
    size?: number;
}

export interface IGetGroupRowsPathParams {
    reportId: string;
    groupId: string;
}

export function getGroupRows(args: IGetGroupRowsArgs) {
    if (args.pageUrl) {
        return axios.get(args.pageUrl);
    }

    args.params = {
        page: args.params.page,
        size: args.params.size,
    };

    const query = qs.stringify(args.params, strigifyOpts);

    return axios.get(`/platform-api/reporting/report/${args.path.reportId}/groups/${args.path.groupId}${query}`);
}

export function getReportingInfo(entityClass: string, parentFldClass: string = '', columnPath: string = '', onlyRange: boolean = false) {
    if (HelperFeatureFlags.isUseModelsInfo()) {
        const params = {entityModel: entityClass};
        if (parentFldClass) params.parentFieldType = encodeURIComponent(parentFldClass);
        if (columnPath) params.columnPath = encodeURIComponent(columnPath);
        if (onlyRange) params.onlyRange = onlyRange;
        const query = qs.stringify(params, strigifyOpts);
        return axios.get(`/platform-api/entity-info/model-info${query}`);
    }
    const params = {entityClass};
    if (parentFldClass) params.parentFldClass = encodeURIComponent(parentFldClass);
    if (columnPath) params.columnPath = encodeURIComponent(columnPath);
    if (onlyRange) params.onlyRange = onlyRange;
    const query = qs.stringify(params, strigifyOpts);
    return axios.get(`/platform-api/entity-info/info${query}`);
}

export function getStreamData(data: IDefinitionContentStreamRequest) {
    return axios.post<IDefinitionContentStreamResult>(`/platform-api/stream-data/get`, data);
}

export function getMappers(params: {
    inClass: string
} = {} as any) {
    return axios.get<ReportMapper[]>(`/platform-api/entity-info/fetch/mappers`, {params});
}

export function validateReport(data: IDefinitionContent) {
    return axios.post(`/platform-api/reporting/validate/report`, data);
}

export function getEntityLoad(entityId: string, entityClass: string, parentFldClass: string = '', columnPath: string = '') {
    let params: {
        entityId: string,
        entityClass: string,
        parentFldClass?: string,
        columnPath?: string
    } = {
        entityClass,
        entityId
    };
    if (parentFldClass) params.parentFldClass = encodeURIComponent(parentFldClass);
    if (columnPath) params.columnPath = encodeURIComponent(columnPath);
    if (entityId) params.entityId = encodeURIComponent(entityId);
    const query = qs.stringify(params, strigifyOpts);
    return axios.get<Entity[]>(`/platform-api/entity-info/fetch/lazy${query}`);
}

export function getTransitionsForEntity(entityId: string, entityClass: string) {
    return axios.get<string[]>(`/platform-api/entity/fetch/transitions?entityId=${encodeURIComponent(entityId)}&entityClass=${entityClass}`);
}

export function putTransitionsForEntity(entityId: string, entityClass: string, transitionName: string) {
    return axios.put(`/platform-api/entity/transition?entityId=${encodeURIComponent(entityId)}&entityClass=${entityClass}&transitionName=${transitionName}`);
}

export function getReportingFetchTypes(onlyDynamic = false) {
    // if (HelperFeatureFlags.isUseMetaModelEnabled()) {
    //   return axios.get<string[]>(`/platform-api/entity-info/fetch/models?onlyDynamic=${onlyDynamic}`);
    // }

    if (HelperFeatureFlags.isUseModelsInfo()) {
        return axios.get<string[]>(`/platform-api/entity-info/fetch/models-info?onlyDynamic=${onlyDynamic}`);
    }
    return axios.get<string[]>(`/platform-api/entity-info/fetch/types?onlyDynamic=${onlyDynamic}`);
}

export function getReportingRelatedPaths(entityClass: string) {
    if (HelperFeatureFlags.isUseModelsInfo()) {
        return axios.get<RelatedPath[]>(`/platform-api/entity-info/model-info/related/paths?entityModel=${entityClass}`);
    }
    return axios.get<RelatedPath[]>(`/platform-api/entity-info/related/paths?entityClass=${entityClass}`);
}

export function postCatalogItem(data: CatalogItem) {
    return axios.post<string>(`/platform-api/catalog/item`, data);
}

export function putCatalogItem(data: CatalogItem, id: string) {
    return axios.put(`/platform-api/catalog/item?itemId=${id}`, data);
}

export function getCatalogItems(entityClass: string) {
    return axios.get(`/platform-api/catalog/item/class?entityClass=${entityClass}`);
}

export function deleteCatalogItems(id: string) {
    return axios.delete(`/platform-api/catalog/item?itemId=${id}`);
}

export function getAllCatalogItems() {
    return axios.get<CatalogItem[]>(`/platform-api/catalog/item/all`);
}

export function getCatalogItemExport(entityClasses: string) {
    return axios.get<CatalogItem[]>(`/platform-api/catalog/item/export?entityClasses=${entityClasses}`);
}

export function getCatalogItemExportByIds(ids: string[], isSingleFile: boolean = true) {
    return axios.get<CatalogItemExportImportContainer>(`/platform-api/catalog/item/export-by-ids?ids=${ids}&isSingleFile=${isSingleFile}`);
}

export function postCatalogItemImport(data: CatalogItemExportImportContainer, params = {}) {
    return axios.post(`/platform-api/catalog/item/import?needRewrite=true`, data, {params});
}

export function getWorkflowsStates(id: string) {
    return axios.get(`/platform-api/workflows/${id}/states`);
}

export function getTransitions() {
    return axios.get(`/platform-api/entity/fetch/transitions`);
}

export function putEntity(data: EntityRequest) {
    return axios.put(`/platform-api/entity`, data);
}

export function versionPlatform() {
    return axios.get<VersionPlatform>(`/platform-api/version/platform`);
}

export function versionClient() {
    return axios.get<VersionClient>(`/platform-api/version/client`);
}

export function queryPlan(condition: IDefinitionContentConditionGroup, entityClass: string, aliasDefs: AliasDef) {
    return axios.post(`/platform-api/stream-data/query-plan`, {condition, entityClass, aliasDefs});
}

export function usersList(data: string[]) {
    return axios.post<User[]>(`/platform-api/users/get-by-ids`, data);
}

export function getAllCompositeIndexes(entity: string) {
    return axios.get<IndexConfiguration[]>(`/platform-common/composite-indexes/list?entityClass=${entity}`);
}

export function postCompositeIndexesReindex(indexId: string) {
    return axios.post(`/platform-common/composite-indexes/reindex`, [indexId]);
}

export function postCompositeIndexesCreate(data: any) {
    return axios.post<IndexConfiguration[]>(`/platform-common/composite-indexes/create`, data);
}

export function postCompositeIndexesImport(data: any) {
    return axios.post<IndexConfiguration[]>(`/platform-common/composite-indexes/import`, data);
}

export function postCompositeIndexesExportByIds(ids: string[]) {
    return axios.post(`/platform-common/composite-indexes/export-by-ids`, ids);
}

export function postCompositeIndexesDelete(indexId: string) {
    return axios.post<IndexConfiguration[]>(`/platform-common/composite-indexes/delete`, [indexId]);
}

export function getEntityTransactions(entityClass: string, entityId: string) {
    return axios.get<Transaction[]>(`/platform-api/fetch/transactions?entityClass=${entityClass}&entityId=${encodeURIComponent(entityId)}`);
}

export function getEntityDiff(entityClass: string, entityId: string, firstTx: string, lastTx: string) {
    return axios.get<TransactionDiff>(`/platform-api/transactions/diff?entityClass=${entityClass}&entityId=${encodeURIComponent(entityId)}&firstTx=${firstTx}&lastTx=${lastTx}`);
}

export function getCachesList() {
    return axios.get<Cache[]>(`/platform-common/cache-info/caches-list`);
}

export function getInvalidateCache(cacheType: string) {
    return axios.get<Cache[]>(`/platform-common/cache-info/invalidate-cache?cacheType=${cacheType}`);
}

export function getCacheKeys(cacheType: string) {
    return axios.get<string[]>(`/platform-common/cache-info/cache-keys?cacheType=${encodeURIComponent(cacheType)}`);
}

export function getNetInfoServer() {
    return axios.get<ServerInfo>(`/platform-common/net-info/server`);
}

export function getNetInfoClients() {
    return axios.get(`/platform-common/net-info/clients`);
}

export function getZkInfoCurrNodeInfo() {
    return axios.get<NodeInfo>(`/platform-common/zk-info/curr-node-info`);
}

export function getZkInfoLoadedOnlineNodes() {
    return axios.get(`/platform-common/zk-info/loaded-online-nodes`);
}

export function getZkInfoLoadedShardsDistribution() {
    return axios.get<ShardsDistr>(`/platform-common/zk-info/loaded-shards-distribution`);
}

export function getZkInfoClusterState() {
    return axios.get<ClusterState>(`/platform-common/zk-info/cluster-state`);
}

export function getStatemachineCheck() {
    return axios.get('/platform-api/statemachine/check');
}

export function postStatemachineFix() {
    return axios.post('/platform-api/statemachine/fix');
}

export function deleteEntityByIds(className, ids: string[] = []) {
    return axios.delete(`/platform-api/entity`, {
        data: {
            entityClass: className,
            entityIds: ids
        }
    });
}

export function platformApiStreamDataDelete(data) {
    return axios.delete(`/platform-api/stream-data/delete`, {data});
}

export function getEntityById(id: string) {
    return axios.get(`entity/${id}`);
}
