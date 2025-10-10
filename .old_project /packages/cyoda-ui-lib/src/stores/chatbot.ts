import { defineStore } from "pinia";
import axios from "../plugins/axios";
import { PromptsAddNewRequest, PromptsCategory } from "../types/types";

const baseUrl = import.meta.env.VITE_APP_AI_BASE || "";
export const useChatbotStore = defineStore({
  id: "chatbot",
  actions: {
    async postMappingsInitial(data) {
      return await axios.post(`${baseUrl}/v1/mappings/initial`, data);
    },
    async getMappingsAiChat(data, signal = undefined) {
      return await axios.post(`${baseUrl}/v1/mappings/chat`, data, { signal });
    },
    async postConnectionsInitial(data) {
      return await axios.post(`${baseUrl}/v1/connections/initial`, data);
    },
    async getConnectionsAiChat(data, signal = undefined) {
      return await axios.post(`${baseUrl}/v1/connections/chat`, data, { signal });
    },
    async postTrinoInitial(data) {
      return await axios.post(`${baseUrl}/v1/trino/initial`, data);
    },
    async getTrinoAiChat(chatId, data, signal = undefined) {
      return await axios.post(`${baseUrl}/v1/trino/chat?chat_id=${chatId}`,
        data,
        {
          signal,
          headers: {
            "trino-host": import.meta.env.VITE_APP_TRINO_URL || import.meta.env.VITE_APP_API_BASE
          }
        });
    },
    async getTrinoAiChatRunQuery(query, signal = undefined) {
      return await axios.post(`${baseUrl}/v1/trino/run-query`, { query }, {
        signal,
        headers: {
          "trino-host": import.meta.env.VITE_APP_TRINO_URL || import.meta.env.VITE_APP_API_BASE
        }
      });
    },
    async getWorkflowsAiChat(data, signal = undefined) {
      if (data.json_data) {
        return await axios.postForm(`${baseUrl}/v1/workflows/chat`, data, { signal });
      }
      return await axios.post(`${baseUrl}/v1/workflows/chat`, data, { signal });
    },
    async getWorkflowsInitial(chat_id) {
      return await axios.post(`${baseUrl}/v1/workflows/initial`, { chat_id });
    },
    async getChatHistory(category, chat_id) {
      return await axios.get(`${baseUrl}/v1/${category}/user-chat-history`, { params: { chat_id } });
    },
    async getSaveChat(category, chat_id) {
      return await axios.get(`${baseUrl}/v1/${category}/save-chat`, { params: { chat_id } });
    },
    async putUpdateId(category, data) {
      return await axios.put(`${baseUrl}/v1/${category}/update-id`, data);
    },
    async getReturnData(category: PromptsCategory) {
      return await axios.get(`${baseUrl}/v1/${category}/return-data`);
    },
    async isInitialized(category: PromptsCategory, chat_id) {
      return await axios.get(`${baseUrl}/v1/${category}/initialized`, { params: { chat_id } });
    },
    async getChatClear(category: PromptsCategory, chat_id) {
      return await axios.get(`${baseUrl}/v1/${category}/chat-clear`, { params: { chat_id } });
    },
    async getPromtsDefault(category: PromptsCategory) {
      return await axios.get(`${baseUrl}/v1/prompts/${category}/default`);
    },
    async getPromtsByUser(category: PromptsCategory, username: string) {
      return await axios.get(`${baseUrl}/v1/prompts/${category}/${username}`);
    },
    async postPromtsByUser(category: PromptsCategory, username: string, data: PromptsAddNewRequest) {
      return await axios.post(`${baseUrl}/v1/prompts/${category}/${username}`, data);
    },
    async deletePromtsByUser(category: PromptsCategory, username: string, index: number) {
      return await axios.delete(`${baseUrl}/v1/prompts/${category}/${username}/${index}`);
    }
  }
});
