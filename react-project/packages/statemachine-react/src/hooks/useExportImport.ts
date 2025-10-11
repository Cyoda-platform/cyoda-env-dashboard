/**
 * Export/Import Hooks
 * Hooks for exporting and importing workflows
 * Migrated from: .old_project/packages/cyoda-ui-lib/src/components-library/elements/ExportImport
 */

import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import type { Workflow } from '../types';

export interface ExportFormat {
  extension: 'json' | 'zip';
  description: string;
}

export const EXPORT_FORMATS: ExportFormat[] = [
  {
    extension: 'json',
    description: 'JSON format allows users to re-import file in UI',
  },
  {
    extension: 'zip',
    description: 'ZIP format does not allow users to re-import in UI',
  },
];

export interface ExportWorkflowsParams {
  workflows: Workflow[];
  format: ExportFormat;
}

export interface ImportWorkflowsParams {
  data: any;
  needRewrite?: boolean;
}

/**
 * Hook for exporting workflows
 */
export const useExportWorkflows = () => {
  return useMutation({
    mutationFn: async ({ workflows, format }: ExportWorkflowsParams) => {
      if (format.extension === 'zip') {
        // Export as ZIP
        const entityClasses = workflows.map((w) => encodeURIComponent(w.entityClassName));
        const response = await axios.get(
          `/platform-api/statemachine/export/zip?entityClasses=${entityClasses.join(',')}&isSingleFile=false`,
          {
            responseType: 'blob',
          }
        );
        
        // Download the file
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `export_workflows.${format.extension}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        return response.data;
      } else {
        // Export as JSON
        const ids = workflows.map((w) => `includeIds=${encodeURIComponent(w.id)}`);
        const { data } = await axios.get(`/platform-api/statemachine/export?${ids.join('&')}`);
        
        // Download the file
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `export_workflows.${format.extension}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        return data;
      }
    },
  });
};

/**
 * Hook for importing workflows
 */
export const useImportWorkflows = () => {
  return useMutation({
    mutationFn: async ({ data, needRewrite = true }: ImportWorkflowsParams) => {
      const response = await axios.post(
        `/platform-api/statemachine/import?needRewrite=${needRewrite}`,
        data
      );
      return response.data;
    },
  });
};

/**
 * Utility function to read file as text
 */
export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

/**
 * Utility function to validate imported workflow data
 */
export const validateWorkflowData = (data: any): boolean => {
  try {
    // Check if data has the expected structure
    if (!data || typeof data !== 'object') {
      return false;
    }
    
    // Check if workflow array exists
    if (!Array.isArray(data.workflow)) {
      return false;
    }
    
    // Basic validation of workflow structure
    for (const workflow of data.workflow) {
      if (!workflow.name || !workflow.entityClassName) {
        return false;
      }
    }
    
    return true;
  } catch (error) {
    return false;
  }
};

