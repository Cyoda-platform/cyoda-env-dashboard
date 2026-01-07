/**
 * Mock for @cyoda/tableau-react package
 * Used for development when tableau-react is not available
 */

import React from 'react';

// Mock ModellingPopUp component
export interface ModellingPopUpRef {
  open: () => void;
  close: () => void;
}

export interface ModellingPopUpProps {
  entityClassName?: string;
  onSelect?: (columns: any[]) => void;
  children?: React.ReactNode;
}

export const ModellingPopUp = React.forwardRef<ModellingPopUpRef, ModellingPopUpProps>(
  ({ entityClassName, onSelect, children }, ref) => {
    // Mock implementation
    React.useImperativeHandle(ref, () => ({
      open: () => {
        // Mock open
      },
      close: () => {
        // Mock close
      },
    }));

    return <div data-testid="modelling-popup">{children}</div>;
  }
);

ModellingPopUp.displayName = 'ModellingPopUp';

// Mock ModellingColDefs component
export interface ModellingColDefsProps {
  configDefinition: any;
  onChange?: (configDefinition: any) => void;
}

export const ModellingColDefs: React.FC<ModellingColDefsProps> = ({ configDefinition, onChange }) => {
  return (
    <div data-testid="modelling-coldefs">
      <p>Mock ModellingColDefs Component</p>
      <p>Entity Class: {configDefinition?.requestClass || 'N/A'}</p>
      <p>Columns: {configDefinition?.colDefs?.length || 0}</p>
      <p>Aliases: {configDefinition?.aliasDefs?.length || 0}</p>
    </div>
  );
};

// Mock ReportEditorTabModel component
export interface ReportEditorTabModelProps {
  configDefinition: any;
  onChange?: (configDefinition: any) => void;
  readOnly?: boolean;
  showAliases?: boolean;
}

export const ReportEditorTabModel: React.FC<ReportEditorTabModelProps> = ({
  configDefinition,
  onChange,
  readOnly = false,
  showAliases = true
}) => {
  return (
    <div data-testid="report-editor-tab-model">
      <div data-testid="modelling-coldefs">
        <p>Mock ModellingColDefs Component</p>
        <p>Entity Class: {configDefinition?.requestClass || 'N/A'}</p>
        <p>Columns: {configDefinition?.colDefs?.length || 0}</p>
      </div>
      {showAliases && (
        <div data-testid="modelling-aliases">
          <p>Mock ModellingAliases Component</p>
          <p>Aliases: {configDefinition?.aliasDefs?.length || 0}</p>
        </div>
      )}
    </div>
  );
};

// Mock HelperReportDefinition
export const HelperReportDefinition = {
  buildCols: (configDefinition: any) => {
    // Mock implementation - combines colDefs and aliasDefs
    const SIMPLE_COLUMN = 'com.cyoda.core.reports.columns.ReportSimpleColumn';
    const ALIAS_COLUMN = 'com.cyoda.core.reports.columns.ReportAliasColumn';

    const cols: any[] = [];

    // Add colDefs
    if (configDefinition?.colDefs && Array.isArray(configDefinition.colDefs)) {
      const colDefs = configDefinition.colDefs.map((el: any) => {
        // Extract type from parts.value[0].type (Java class name like "java.lang.String")
        // This is the actual data type, not the column type (LEAF, LIST, etc.)
        let typeStr = '';
        if (el.parts?.value && Array.isArray(el.parts.value) && el.parts.value.length > 0) {
          typeStr = el.parts.value[0].type || '';
        }

        // If no type in parts, fall back to colType
        if (!typeStr) {
          typeStr = el.colType || '';
        }

        // Extract short type name (e.g., "String" from "java.lang.String")
        const typeShort = typeStr.includes('.') ? typeStr.split('.').pop() || '' : typeStr;

        return {
          colType: 'colDef',
          alias: el.fullPath,
          name: el.fullPath,
          typeShort,
          type: typeStr,
          '@bean': SIMPLE_COLUMN,
        };
      });
      cols.push(...colDefs);
    }

    // Add aliasDefs
    if (configDefinition?.aliasDefs && Array.isArray(configDefinition.aliasDefs)) {
      const aliasDefs = configDefinition.aliasDefs.map((el: any) => {
        // Handle aliasType - it might be undefined or a Java class name
        const aliasTypeStr = el.aliasType || '';
        const typeShort = aliasTypeStr.includes('.') ? aliasTypeStr.split('.').pop() || '' : aliasTypeStr;

        return {
          colType: 'aliasDef',
          alias: el.name,
          name: el.name,
          typeShort,
          type: aliasTypeStr,
          '@bean': ALIAS_COLUMN,
        };
      });
      cols.push(...aliasDefs);
    }

    return cols;
  },

  validateConfigDefinition: (conditions: any[]) => {
    // Mock implementation - validates that all conditions have @bean property
    if (!conditions || !Array.isArray(conditions)) {
      return true;
    }

    for (const condition of conditions) {
      // Check if it's a group condition with nested conditions
      if ('conditions' in condition && Array.isArray(condition.conditions)) {
        // Recursively validate nested conditions
        const isValid = HelperReportDefinition.validateConfigDefinition(condition.conditions);
        if (!isValid) {
          return false;
        }
      } else {
        // Check if condition has @bean property
        if (!condition['@bean']) {
          return false;
        }
      }
    }

    return true;
  },
};

