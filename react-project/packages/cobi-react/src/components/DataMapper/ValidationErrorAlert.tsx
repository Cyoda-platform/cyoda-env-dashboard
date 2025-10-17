import React from 'react';
import { Alert } from 'antd';
import type { EntityMappingConfigDto } from '../../types';
import './ValidationErrorAlert.css';

interface ValidationError {
  type: 'columnMapping' | 'functionalMapping';
  message: string;
  srcPath?: string;
  dstPath?: string;
  expectedType?: string;
  column?: any;
  functionalMapping?: any;
}

interface ValidationErrorAlertProps {
  entityMapping: EntityMappingConfigDto | null;
  isSaveButtonTouched: boolean;
  onOpenColumnSettings?: (column: any) => void;
  onOpenFunctionalSettings?: (functionalMapping: any) => void;
}

const ValidationErrorAlert: React.FC<ValidationErrorAlertProps> = ({
  entityMapping,
  isSaveButtonTouched,
  onOpenColumnSettings,
  onOpenFunctionalSettings,
}) => {
  const validateRelations = (): ValidationError[] => {
    if (!entityMapping) return [];

    const errors: ValidationError[] = [];

    // Validate column mappings
    entityMapping.columns.forEach((column) => {
      // Check if transformer output type matches destination type
      if (column.dstCyodaColumnPathType) {
        const expectedType = column.dstCyodaColumnPathType.split('.').pop();
        // TODO: Add actual transformer validation logic
        // For now, this is a placeholder
        const isValid = true; // Replace with actual validation

        if (!isValid) {
          errors.push({
            type: 'columnMapping',
            message: `Output type must be ${expectedType}`,
            srcPath: column.srcColumnPath,
            dstPath: column.dstCyodaColumnPath,
            expectedType: expectedType,
            column: column,
          });
        }
      }
    });

    // Validate functional mappings
    entityMapping.functionalMappings.forEach((fm) => {
      // Check if functional mapping has valid statements
      if (!fm.statements || fm.statements.length === 0) {
        errors.push({
          type: 'functionalMapping',
          message: 'Functional mapping must have at least one statement',
          dstPath: fm.dstPath,
          functionalMapping: fm,
        });
      }

      // Check for other validation rules
      // TODO: Add more validation logic as needed
    });

    return errors;
  };

  const errors = validateRelations();

  if (!isSaveButtonTouched || errors.length === 0) {
    return null;
  }

  const shortNamePath = (path: string): string => {
    if (!path) return '';
    const parts = path.split(/[.@#]/);
    return parts[parts.length - 1] || path;
  };

  return (
    <Alert
      message="Error"
      description={
        <div>
          Please open relation and fix error for:
          <ol className="validation-error-list">
            {errors.map((error, index) => (
              <li key={index} className="error-transform">
                {error.type === 'columnMapping' ? (
                  <div>
                    {error.srcPath} → {shortNamePath(error.dstPath || '')} {error.message}
                    {onOpenColumnSettings && error.column && (
                      <button
                        className="error-link"
                        onClick={() => onOpenColumnSettings(error.column)}
                      >
                        Open Settings
                      </button>
                    )}
                  </div>
                ) : (
                  <div>
                    Error in Functional Mapping for target field "{shortNamePath(error.dstPath || '')}"
                    {error.message && `: ${error.message}`}
                    {onOpenFunctionalSettings && error.functionalMapping && (
                      <button
                        className="error-link"
                        onClick={() => onOpenFunctionalSettings(error.functionalMapping)}
                      >
                        Open Settings
                      </button>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ol>
        </div>
      }
      type="error"
      showIcon
      closable={false}
      className="validation-error-alert"
    />
  );
};

export default ValidationErrorAlert;

