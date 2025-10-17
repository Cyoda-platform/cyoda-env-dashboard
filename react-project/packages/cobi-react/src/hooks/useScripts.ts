import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../api/axios';

// API functions
export const scriptsApi = {
  getScript: async (scriptName: string) => {
    const { data } = await axios.get(`/scripts/${encodeURIComponent(scriptName)}`);
    return data;
  },

  getListAll: async (params: any = {}) => {
    const { data } = await axios.get('/scripts/list-all', { params });
    return data;
  },

  getVersion: async (versionID: string) => {
    const { data } = await axios.get(`/scripts/versions/${versionID}`);
    return data;
  },

  putVersion: async (scriptData: any) => {
    const { data } = await axios.put('/scripts/versions', scriptData);
    return data;
  },

  putImport: async (scriptData: any) => {
    const { data } = await axios.put('/scripts/import', scriptData);
    return data;
  },

  deleteVersion: async (versionID: string) => {
    const { data } = await axios.delete(`/scripts/versions/${versionID}`);
    return data;
  },

  setDefaultScript: async (versionID: string) => {
    const { data } = await axios.post(`/scripts/versions/${versionID}/default`);
    return data;
  },

  setActiveForAll: async (versionID: string) => {
    const { data } = await axios.post(`/scripts/versions/${versionID}/active`);
    return data;
  },

  refresh: async () => {
    const { data } = await axios.post('/scripts/refresh');
    return data;
  },

  renameScript: async ({ oldName, newName }: { oldName: string; newName: string }) => {
    const { data } = await axios.post(`/scripts/${encodeURIComponent(oldName)}`, {
      scriptName: newName,
    });
    return data;
  },

  deleteScript: async (scriptName: string) => {
    const { data } = await axios.delete(`/scripts/${encodeURIComponent(scriptName)}`);
    return data;
  },

  renameVersion: async (versionData: { id: string; [key: string]: any }) => {
    const { data } = await axios.post(`/scripts/versions/${versionData.id}`, versionData);
    return data;
  },
};

// React Query hooks
export const useScriptsApi = {
  // Get script by name
  useGetScript: (scriptName: string, options = {}) => {
    return useQuery({
      queryKey: ['script', scriptName],
      queryFn: () => scriptsApi.getScript(scriptName),
      enabled: !!scriptName,
      ...options,
    });
  },

  // Get all scripts
  useListAll: (params: any = {}, options = {}) => {
    return useQuery({
      queryKey: ['scripts', 'list', params],
      queryFn: () => scriptsApi.getListAll(params),
      ...options,
    });
  },

  // Get script version
  useGetVersion: (versionID: string, options = {}) => {
    return useQuery({
      queryKey: ['script', 'version', versionID],
      queryFn: () => scriptsApi.getVersion(versionID),
      enabled: !!versionID,
      ...options,
    });
  },

  // Create/update version
  usePutVersion: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: scriptsApi.putVersion,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['scripts'] });
      },
    });
  },

  // Import script
  usePutImport: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: scriptsApi.putImport,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['scripts'] });
      },
    });
  },

  // Delete version
  useDeleteVersion: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: scriptsApi.deleteVersion,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['scripts'] });
      },
    });
  },

  // Set default script
  useSetDefaultScript: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: scriptsApi.setDefaultScript,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['scripts'] });
      },
    });
  },

  // Set active for all
  useSetActiveForAll: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: scriptsApi.setActiveForAll,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['scripts'] });
      },
    });
  },

  // Refresh scripts cache
  useRefresh: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: scriptsApi.refresh,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['scripts'] });
      },
    });
  },

  // Rename script
  useRenameScript: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: scriptsApi.renameScript,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['scripts'] });
      },
    });
  },

  // Delete script
  useDeleteScript: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: scriptsApi.deleteScript,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['scripts'] });
      },
    });
  },

  // Rename version
  useRenameVersion: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: scriptsApi.renameVersion,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['scripts'] });
      },
    });
  },
};

