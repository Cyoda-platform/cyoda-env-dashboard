import {defineStore} from "pinia";
import axios from "@cyoda/ui-lib/src/plugins/axios";
import HelperFeatureFlags from '@cyoda/ui-lib/src/helpers/HelperFeatureFlags.ts'

export const useStatemachineStore = defineStore('statemachine', {
    actions: {
        getWorkflowEnabledTypes() {
            if (HelperFeatureFlags.isUseModelsInfo()) {
              return axios.get<string[]>(`/platform-api/entity-info/fetch/models-info?stateEnabled=true`);
            }
            return axios.get('/platform-api/statemachine/workflow-enabled-types');
        },
        getAllWorkflowsList(entityClassName = undefined) {
            return axios.get('/platform-api/statemachine/workflows', {params: {entityClassName}});
        },
        postWorkflow(form) {
            return axios.post('/platform-api/statemachine/persisted/workflows', form)
        },
        putWorkflow(form) {
            return axios.put(`/platform-api/statemachine/persisted/workflows/${encodeURIComponent(form.id)}`, form)
        },
        deleteWorkflow(workflowId) {
            return axios.delete(`/platform-api/statemachine/persisted/workflows/${encodeURIComponent(workflowId)}`)
        },
        copyWorkflow(persistedType, workflowId) {
            return axios.post(`/platform-api/statemachine/${persistedType}/workflows/copy/${encodeURIComponent(workflowId)}`)
        },
        getWorkflow(persistedType, workflowId) {
            return axios.get(`/platform-api/statemachine/${persistedType}/workflows/${encodeURIComponent(workflowId)}`);
        },
        getTransitionsList(persistedType, workflowId) {
            return axios.get(`/platform-api/statemachine/${persistedType}/workflows/${encodeURIComponent(workflowId)}/transitions`);
        },
        getState(persistedType, workflowId, stateId) {
            return axios.get(`/platform-api/statemachine/${persistedType}/workflows/${encodeURIComponent(workflowId)}/states/${encodeURIComponent(stateId)}`);
        },
        getStatesList(persistedType, workflowId) {
            return axios.get(`/platform-api/statemachine/${persistedType}/workflows/${encodeURIComponent(workflowId)}/states`);
        },
        postState(persistedType, workflowId, transitionId, form) {
            return axios.post(`/platform-api/statemachine/${persistedType}/workflows/${encodeURIComponent(workflowId)}/transitions/${encodeURIComponent(transitionId)}/states`, form);
        },
        putState(persistedType, workflowId, stateId, form) {
            return axios.put(`/platform-api/statemachine/${persistedType}/workflows/${encodeURIComponent(workflowId)}/states/${stateId}`, form);
        },
        deleteState(persistedType, workflowId, stateId) {
            return axios.delete(`/platform-api/statemachine/${persistedType}/workflows/${encodeURIComponent(workflowId)}/states/${stateId}`);
        },
        getTransition(persistedType, workflowId, transitionId) {
            return axios.get(`/platform-api/statemachine/${persistedType}/workflows/${encodeURIComponent(workflowId)}/transitions/${encodeURIComponent(transitionId)}`);
        },
        postTransition(persistedType, workflowId, form) {
            return axios.post(`/platform-api/statemachine/${persistedType}/workflows/${encodeURIComponent(workflowId)}/transitions`, form);
        },
        putTransition(persistedType, workflowId, transitionId, form) {
            return axios.put(`/platform-api/statemachine/${persistedType}/workflows/${encodeURIComponent(workflowId)}/transitions/${encodeURIComponent(transitionId)}`, form);
        },
        deleteTransition(persistedType, workflowId, transitionId) {
            return axios.delete(`/platform-api/statemachine/${persistedType}/workflows/${encodeURIComponent(workflowId)}/transitions/${encodeURIComponent(transitionId)}`);
        },
        getCriteriaList(entityClassName = undefined) {
            return axios.get('/platform-api/statemachine/criteria', {params: {entityClassName}});
        },
        async getCriteria(persistedType, criteriaId, entityClassName = undefined) {
            const {data: responseData} = await axios.get(`/platform-api/statemachine/${persistedType}/criteria/${criteriaId}`, {params: {entityClassName}});

            if (!responseData.name && responseData.id) {
                responseData.name = responseData.id;
            }
            if (!responseData.hasOwnProperty('description')) responseData.description = "";
            if (responseData.condition && !responseData.condition.hasOwnProperty('conditions')) {
                responseData.condition = {
                    "@bean": "com.cyoda.core.conditions.GroupCondition",
                    operator: "AND",
                    conditions: [responseData.condition]
                }
            }
            return {data: responseData};
        },
        getCriteriaDefs(params) {
            const colPaths = params.colPaths
                .map(el => `colPath=${encodeURIComponent(el)}`)
                .join('&');
            return axios.get(`/platform-api/entity-info/fetch/coldefs?rootClass=${params.rootClass}&${colPaths}`);
        },
        postCriteria(persistedType, form) {
            return axios.post(`/platform-api/statemachine/${persistedType}/criteria`, form);
        },
        putCriteria(persistedType, criteriaId, form) {
            return axios.put(`/platform-api/statemachine/${persistedType}/criteria/${criteriaId}`, form);
        },
        deleteCriteria(persistedType, criteriaId) {
            return axios.delete(`/platform-api/statemachine/${persistedType}/criteria/${criteriaId}`)
        },
        getEntityParentClassesAndInterfaces(entityClass: string) {
            return axios.get(
                `/platform-api/entity-info/entity-parents-interfaces?entityClass=${entityClass}`
            );
        },
        getProcessesList(entityClassName = undefined) {
            return axios.get('/platform-api/statemachine/processes', {params: {entityClassName}});
        },
        getProcessorsList() {
            return axios.get('/platform-api/statemachine/processors');
        },
        postProcesses(persistedType, form) {
            return axios.post(`/platform-api/statemachine/${persistedType}/processes`, form);
        },
        postProcessesTemplate(persistedType, form) {
            return axios.post(`/platform-api/statemachine/${persistedType}/processes/template`, form);
        },
        putProcesses(persistedType, processId, form) {
            return axios.put(`/platform-api/statemachine/${persistedType}/processes/${processId}`, form);
        },
        putProcessesTemplate(persistedType, processId, form) {
            return axios.put(`/platform-api/statemachine/${persistedType}/processes/template/${processId}`, form);
        },
        getProcesses(persistedType, processId, entityClassName = undefined) {
            return axios.get(`/platform-api/statemachine/${persistedType}/processes/${processId}`, {params: {entityClassName}});
        },
        deleteProcesses(persistedType, processId) {
            return axios.delete(`/platform-api/statemachine/${persistedType}/processes/${processId}`)
        },
        postInstances(data:any) {
            return axios.post(`/platform-api/statemachine/instances`, data);
        },
        getCriteriacheckers(entityClassName = undefined) {
            return axios.get(`/platform-api/statemachine/criteriacheckers`, {params: {entityClassName}});
        }
    }
})
