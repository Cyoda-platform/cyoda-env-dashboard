import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, message } from 'antd';

interface RequestParam {
  reportClass: string;
  reportClassShort: string;
  baseColumnPath: string;
  columnPath?: string;
  key?: string;
}

interface AssignModeElementDialogProps {
  allRequestParams: RequestParam[];
  requestParamsComputed: RequestParam[];
  onSave: (element: RequestParam) => void;
  onEdit: (data: { oldPartColumnName: string; newPartColumnName: string }) => void;
}

export interface AssignModeElementDialogRef {
  open: () => void;
  close: () => void;
  createNew: () => void;
  editExist: (elementData: RequestParam) => void;
}

const AssignModeElementDialog = forwardRef<AssignModeElementDialogRef, AssignModeElementDialogProps>(
  ({ allRequestParams, requestParamsComputed, onSave, onEdit }, ref) => {
    const [visible, setVisible] = useState(false);
    const [mode, setMode] = useState<'create' | 'edit'>('create');
    const [dataBefore, setDataBefore] = useState<RequestParam | null>(null);
    const [form] = Form.useForm();

    useImperativeHandle(ref, () => ({
      open: () => setVisible(true),
      close: () => setVisible(false),
      createNew: () => {
        setMode('create');
        setVisible(true);
      },
      editExist: (elementData: RequestParam) => {
        setMode('edit');
        setDataBefore(elementData);
        form.setFieldsValue({
          key: elementData.key,
          element: elementData,
        });
        setVisible(true);
      },
    }));

    useEffect(() => {
      if (visible && mode === 'create') {
        form.setFieldsValue({
          key: `key${requestParamsComputed.length + 1}`,
        });
      }
    }, [visible, mode, requestParamsComputed.length, form]);

    const handleSave = async () => {
      try {
        const values = await form.validateFields();
        const elementTmp = JSON.parse(JSON.stringify(values.element));
        elementTmp.columnPath = `${elementTmp.baseColumnPath}.[${values.key}]@${elementTmp.reportClass.replaceAll('.', '#')}`;
        elementTmp.key = values.key;

        if (mode === 'create') {
          onSave(elementTmp);
          message.success('Element added successfully');
        } else {
          const oldPartColumnName = `${values.element.baseColumnPath}.[${dataBefore?.key}]`;
          const newPartColumnName = `${values.element.baseColumnPath}.[${values.key}]`;
          if (dataBefore) {
            dataBefore.columnPath = values.element.columnPath;
            dataBefore.key = values.key;
          }
          onEdit({ oldPartColumnName, newPartColumnName });
          message.success('Element updated successfully');
        }

        setVisible(false);
        form.resetFields();
      } catch (error) {
        console.error('Validation failed:', error);
      }
    };

    const handleCancel = () => {
      setVisible(false);
      form.resetFields();
    };

    const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/[*.&]/g, '');
      form.setFieldsValue({ key: value });
    };

    return (
      <Modal
        title="Add New Element"
        open={visible}
        onCancel={handleCancel}
        width={600}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Close
          </Button>,
          <Button key="save" type="primary" onClick={handleSave}>
            {mode === 'create' ? 'Add' : 'Edit'}
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="horizontal"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
        >
          <Form.Item
            name="key"
            label="Key"
            rules={[{ required: true, message: 'Please input key' }]}
          >
            <Input placeholder="Please input" onChange={handleKeyChange} />
          </Form.Item>

          <Form.Item
            name="element"
            label="Class"
            rules={[{ required: true, message: 'Please select class' }]}
          >
            <Select
              placeholder="Select"
              disabled={mode === 'edit'}
              options={allRequestParams.map((item) => ({
                label: item.reportClassShort,
                value: item,
              }))}
              fieldNames={{ label: 'reportClassShort', value: 'reportClass' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    );
  }
);

AssignModeElementDialog.displayName = 'AssignModeElementDialog';

export default AssignModeElementDialog;

