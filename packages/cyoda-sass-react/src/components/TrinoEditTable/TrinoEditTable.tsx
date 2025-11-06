import React, { useMemo } from 'react';
import { Input, Checkbox } from 'antd';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAlignJustify, faEye } from '@fortawesome/free-solid-svg-icons';
import type { SqlField, SqlTable } from '../../types';
import { getAllFields } from '../../utils/helpers';
import './TrinoEditTable.css';

interface TrinoEditTableProps {
  table: SqlTable;
  fieldsName?: string;
  basePropPath?: string;
  allFields?: SqlField[];
  onFieldsChange?: (fields: SqlField[]) => void;
}

interface SortableRowProps {
  field: SqlField;
  index: number;
  isExistArray: boolean;
  basePropPath: string;
  fieldsName: string;
  allFields: SqlField[];
  onHide: (field: SqlField) => void;
  onFieldChange: (index: number, field: SqlField) => void;
  table: SqlTable;
}

const SortableRow: React.FC<SortableRowProps> = ({
  field,
  index,
  isExistArray,
  basePropPath,
  fieldsName,
  allFields,
  onHide,
  onFieldChange,
  table,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: field.fieldName || `field-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Validate field name
  const validateFieldName = (row: SqlField): string | undefined => {
    if (row.flatten) return undefined;
    const fieldNames = allFields.filter((el) => !el.hidden).filter((el) => el.fieldName === row.fieldName);
    if (fieldNames.length > 1) {
      return 'The "Field Name" field must be unique';
    }
    return undefined;
  };

  const getPropPath = (idx: number) => {
    return `${basePropPath}.${fieldsName}.${idx}`;
  };

  const handleFieldNameChange = (value: string) => {
    onFieldChange(index, { ...field, fieldName: value });
  };

  const handleFlattenChange = (checked: boolean) => {
    onFieldChange(index, { ...field, flatten: checked });
  };

  const isNotData = field.fieldCategory !== 'DATA';

  if (field.hidden) {
    return null;
  }

  return (
    <div ref={setNodeRef} style={style}>
      <div className={`row-container ${isNotData ? 'not-data' : ''}`}>
        <div className="cell col1">
          <FontAwesomeIcon
            className="handle"
            icon={faAlignJustify}
            {...attributes}
            {...listeners}
          />
          <FontAwesomeIcon
            className="eye"
            icon={faEye}
            onClick={() => onHide(field)}
          />
        </div>
        <div className="cell cell-item col2">
          <div style={{ width: '100%' }}>
            <Input
              value={field.fieldName}
              onChange={(e) => handleFieldNameChange(e.target.value)}
              status={validateFieldName(field) ? 'error' : ''}
            />
            {validateFieldName(field) && (
              <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
                {validateFieldName(field)}
              </div>
            )}
          </div>
        </div>
        <div className="cell col3">
          <span>{field.fieldKey || field.fieldName}</span>
        </div>
        <div className="cell col4">
          <span>{field.fieldType || field.dataType}</span>
        </div>
        {isExistArray && (
          <div className="cell col5">
            {field.isArray && (
              <Checkbox
                checked={field.flatten}
                onChange={(e) => handleFlattenChange(e.target.checked)}
              />
            )}
          </div>
        )}
      </div>

      {isExistArray && field.flatten && field.arrayFields && (
        <div className="expand-row">
          <TrinoEditTable
            table={{ ...table, fields: field.arrayFields } as SqlTable}
            fieldsName="arrayFields"
            basePropPath={`${getPropPath(index)}.arrayFields`}
            allFields={allFields}
            onFieldsChange={(newFields) => {
              onFieldChange(index, { ...field, arrayFields: newFields });
            }}
          />
        </div>
      )}
    </div>
  );
};

const TrinoEditTable: React.FC<TrinoEditTableProps> = ({
  table,
  fieldsName = 'fields',
  basePropPath = '',
  allFields: providedAllFields,
  onFieldsChange,
}) => {
  const fields = table[fieldsName as keyof SqlTable] as SqlField[] || [];
  
  // Calculate all fields if not provided
  const allFields = useMemo(() => {
    return providedAllFields || getAllFields(fields);
  }, [providedAllFields, fields]);

  // Check if any field is an array
  const isExistArray = useMemo(() => {
    return fields.some((el) => el.isArray);
  }, [fields]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => (f.fieldName || `field-${fields.indexOf(f)}`) === active.id);
      const newIndex = fields.findIndex((f) => (f.fieldName || `field-${fields.indexOf(f)}`) === over.id);

      const newFields = arrayMove(fields, oldIndex, newIndex);
      
      // Update the table object
      (table[fieldsName as keyof SqlTable] as SqlField[]) = newFields;
      
      if (onFieldsChange) {
        onFieldsChange(newFields);
      }
    }
  };

  const handleHideField = (field: SqlField) => {
    field.hidden = true;
    if (onFieldsChange) {
      onFieldsChange([...fields]);
    }
  };

  const handleFieldChange = (index: number, updatedField: SqlField) => {
    const newFields = [...fields];
    newFields[index] = updatedField;
    (table[fieldsName as keyof SqlTable] as SqlField[]) = newFields;
    
    if (onFieldsChange) {
      onFieldsChange(newFields);
    }
  };

  return (
    <div className="trino-edit-table">
      <div className="table-container">
        <div className="row-container">
          <div className="header col1"></div>
          <div className="header col2">Field Name</div>
          <div className="header col3">Field Key</div>
          <div className="header col4">Data Type</div>
          {isExistArray && <div className="header col5">Flatten</div>}
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={fields.map((f, i) => f.fieldName || `field-${i}`)}
            strategy={verticalListSortingStrategy}
          >
            {fields.map((field, index) => (
              <SortableRow
                key={field.fieldName || `field-${index}`}
                field={field}
                index={index}
                isExistArray={isExistArray}
                basePropPath={basePropPath}
                fieldsName={fieldsName}
                allFields={allFields}
                onHide={handleHideField}
                onFieldChange={handleFieldChange}
                table={table}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};

export default TrinoEditTable;

