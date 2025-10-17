import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Modal, Form, Input, Button, Alert, message } from 'antd';
import type { EntityMappingConfigDto, Metadata } from '../../../types';
import TransformerConfig from '../Transformers/TransformerConfig';
import './MetadataDialog.css';

export interface MetadataDialogRef {
  open: (
    dstCyodaColumnPath: string,
    dstCyodaColumnPathType: string,
    entityMapping: EntityMappingConfigDto
  ) => void;
}

interface MetadataDialogProps {
  onSave?: (metadata: Metadata) => void;
  onDelete?: (metadata: Metadata) => void;
}

const MetadataDialog = forwardRef<MetadataDialogRef, MetadataDialogProps>(
  ({ onSave, onDelete }, ref) => {
    const [visible, setVisible] = useState(false);
    const [form] = Form.useForm();
    const [dstCyodaColumnPath, setDstCyodaColumnPath] = useState('');
    const [dstCyodaColumnPathType, setDstCyodaColumnPathType] = useState('');
    const [entityMapping, setEntityMapping] = useState<EntityMappingConfigDto | null>(null);
    const [currentMeta, setCurrentMeta] = useState<Metadata | null>(null);
    const [isEdit, setIsEdit] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

    useImperativeHandle(ref, () => ({
      open: (path, pathType, mapping) => {
        setDstCyodaColumnPath(path);
        setDstCyodaColumnPathType(pathType);
        setEntityMapping(mapping);

        // Check if metadata already exists for this path
        const existing = mapping.metadata?.find((m) => m.dstCyodaColumnPath === path);
        setCurrentMeta(existing || null);
        setIsEdit(!!existing);

        if (existing) {
          form.setFieldsValue({
            name: existing.name,
            defaultValue: existing.defaultValue,
          });
        } else {
          form.resetFields();
        }

        setErrors([]);
        setVisible(true);
      },
    }));

    const shortNamePath = (path: string): string => {
      const parts = path.split('.');
      return parts.length > 3 ? `...${parts.slice(-3).join('.')}` : path;
    };

    const getFinalType = (): string => {
      const parts = dstCyodaColumnPathType.split('.');
      return parts[parts.length - 1]?.toLowerCase() || '';
    };

    const handleSave = async () => {
      try {
        const values = await form.validateFields();
        setErrors([]);

        const metadata: Metadata = {
          name: values.name,
          dstCyodaColumnPath,
          dstCyodaColumnPathType,
          defaultValue: values.defaultValue || '',
          transformer: values.transformer || {
            children: [],
            type: 'COMPOSITE',
          },
        };

        if (isEdit && currentMeta) {
          // Update existing metadata
          const index = entityMapping?.metadata?.indexOf(currentMeta);
          if (index !== undefined && index !== -1 && entityMapping?.metadata) {
            entityMapping.metadata[index] = metadata;
          }
        } else {
          // Add new metadata
          if (!entityMapping?.metadata) {
            if (entityMapping) {
              entityMapping.metadata = [];
            }
          }
          entityMapping?.metadata?.push(metadata);
        }

        onSave?.(metadata);
        message.success(isEdit ? 'Metadata updated' : 'Metadata created');
        setVisible(false);
      } catch (error: any) {
        if (error.errorFields) {
          const errorMessages = error.errorFields.map((field: any) => field.errors[0]);
          setErrors(errorMessages);
        }
      }
    };

    const handleDelete = () => {
      Modal.confirm({
        title: 'Confirm',
        content: 'Do you really want to remove metadata?',
        onOk: () => {
          if (currentMeta && entityMapping?.metadata) {
            const index = entityMapping.metadata.indexOf(currentMeta);
            if (index !== -1) {
              entityMapping.metadata.splice(index, 1);
            }
          }
          onDelete?.(currentMeta!);
          message.success('Metadata deleted');
          setVisible(false);
        },
      });
    };

    const handleClose = () => {
      setVisible(false);
      form.resetFields();
      setErrors([]);
    };

    return (
      <Modal
        title={
          <div className="metadata-dialog-header">
            <h4>Meta Data</h4>
            <div className="metadata-dialog-info">
              <div>
                <strong>Destination Path:</strong> {shortNamePath(dstCyodaColumnPath)}
              </div>
              <div>
                <strong>Final Type:</strong> {getFinalType()}
              </div>
            </div>
          </div>
        }
        open={visible}
        onCancel={handleClose}
        width={800}
        footer={[
          <Button key="close" onClick={handleClose}>
            Close
          </Button>,
          isEdit && (
            <Button key="delete" danger onClick={handleDelete}>
              Delete
            </Button>
          ),
          <Button key="save" type="primary" onClick={handleSave}>
            {isEdit ? 'Edit' : 'Apply'}
          </Button>,
        ]}
      >
        {errors.length > 0 && (
          <Alert
            message="Errors"
            description={
              <ol>
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ol>
            }
            type="error"
            showIcon
            closable={false}
            style={{ marginBottom: 16 }}
          />
        )}

        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Parameter Name"
            rules={[{ required: true, message: 'Please fill Parameter Name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="defaultValue" label="Default Value">
            <Input />
          </Form.Item>

          <Form.Item name="transformer" label="Transformer">
            <TransformerConfig addFirst />
          </Form.Item>
        </Form>
      </Modal>
    );
  }
);

MetadataDialog.displayName = 'MetadataDialog';

export default MetadataDialog;

