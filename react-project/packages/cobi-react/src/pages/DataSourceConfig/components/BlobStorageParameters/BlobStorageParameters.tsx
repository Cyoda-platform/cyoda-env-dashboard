import React, { useState, useRef, useMemo } from 'react';
import { Table, Button, Modal } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, MenuOutlined } from '@ant-design/icons';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DialogEndpointParametersBlobStorage, {
  DialogEndpointParametersBlobStorageRef,
} from '../DialogEndpointParameters/DialogEndpointParametersBlobStorage';
import './BlobStorageParameters.css';

interface BlobStorageParameter {
  name: string;
  required: boolean;
  defaultValue: string;
  secure?: boolean;
  template?: boolean;
  templateValue?: string;
}

interface BlobStorageParametersProps {
  parameters: BlobStorageParameter[];
  onChange?: (parameters: BlobStorageParameter[]) => void;
}

const DraggableRow = ({ children, ...props }: any) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props['data-row-key'],
  });

  const style = {
    ...props.style,
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: 'move',
    ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
  };

  return (
    <tr {...props} ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </tr>
  );
};

const BlobStorageParameters: React.FC<BlobStorageParametersProps> = ({ parameters, onChange }) => {
  const dialogRef = useRef<DialogEndpointParametersBlobStorageRef>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const isExistTemplatesColumn = useMemo(() => {
    return parameters.some((el) => el.template && el.templateValue);
  }, [parameters]);

  const addNewParameter = () => {
    dialogRef.current?.openDialogAndCreateNew();
  };

  const onEditParameter = (row: BlobStorageParameter) => {
    dialogRef.current?.openDialogAndEditRecord(row);
  };

  const onDeleteParameter = (row: BlobStorageParameter) => {
    Modal.confirm({
      title: 'Confirm!',
      content: 'Do you really want to remove parameter?',
      onOk: () => {
        const index = parameters.indexOf(row);
        if (index !== -1 && onChange) {
          const newParams = [...parameters];
          newParams.splice(index, 1);
          onChange(newParams);
        }
      },
    });
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id && onChange) {
      const oldIndex = parameters.findIndex((item, index) => index === active.id);
      const newIndex = parameters.findIndex((item, index) => index === over.id);
      onChange(arrayMove(parameters, oldIndex, newIndex));
    }
  };

  const columns = [
    ...(parameters.length > 1
      ? [
          {
            title: '',
            key: 'drag',
            width: 50,
            align: 'center' as const,
            render: () => <MenuOutlined className="handle" />,
          },
        ]
      : []),
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Required',
      dataIndex: 'required',
      key: 'required',
      render: (required: boolean) => (required ? 'Yes' : 'No'),
    },
    {
      title: 'Default Value',
      dataIndex: 'defaultValue',
      key: 'defaultValue',
    },
    ...(isExistTemplatesColumn
      ? [
          {
            title: 'Template Value',
            dataIndex: 'templateValue',
            key: 'templateValue',
          },
        ]
      : []),
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, row: BlobStorageParameter) => (
        <>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => onEditParameter(row)}
            size="small"
            style={{ marginRight: 8 }}
          />
          <Button danger icon={<DeleteOutlined />} onClick={() => onDeleteParameter(row)} size="small" />
        </>
      ),
    },
  ];

  const dataWithKeys = parameters.map((item, index) => ({
    ...item,
    key: index,
  }));

  return (
    <div className="blob-storage-parameters">
      <div className="endpoint-actions">
        <Button type="primary" icon={<PlusOutlined />} onClick={addNewParameter}>
          Add New Parameter
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={dataWithKeys.map((_, index) => index)} strategy={verticalListSortingStrategy}>
          <Table
            columns={columns}
            dataSource={dataWithKeys}
            pagination={false}
            components={{
              body: {
                row: DraggableRow,
              },
            }}
          />
        </SortableContext>
      </DndContext>

      <DialogEndpointParametersBlobStorage ref={dialogRef} parameters={parameters} onChange={onChange} />
    </div>
  );
};

export default BlobStorageParameters;

