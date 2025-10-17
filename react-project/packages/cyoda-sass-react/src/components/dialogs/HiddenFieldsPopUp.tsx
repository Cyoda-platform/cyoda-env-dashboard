import { useState, useMemo, useImperativeHandle, forwardRef } from 'react';
import { Modal, Table, Input, Checkbox, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { SqlField } from '../../types';
import './HiddenFieldsPopUp.css';

interface HiddenFieldsPopUpProps {}

export interface HiddenFieldsPopUpRef {
  open: (fields: SqlField[]) => void;
}

interface SqlFieldWithKey extends SqlField {
  fieldKey?: string;
}

const HiddenFieldsPopUp = forwardRef<HiddenFieldsPopUpRef, HiddenFieldsPopUpProps>(
  (_props, ref) => {
    const [visible, setVisible] = useState(false);
    const [filter, setFilter] = useState('');
    const [fields, setFields] = useState<SqlFieldWithKey[]>([]);

    // Open dialog
    useImperativeHandle(ref, () => ({
      open: (fieldsValue: SqlField[] = []) => {
        setVisible(true);
        setFilter('');
        // Add fieldKey for unique identification
        const fieldsWithKeys = fieldsValue.map((field, index) => ({
          ...field,
          fieldKey: field.fieldName || `field-${index}`,
        }));
        setFields(fieldsWithKeys);
      },
    }));

    // Filter hidden fields
    const filteredFields = useMemo(() => {
      return fields
        .filter((el) => el.hidden)
        .filter((el) => {
          if (!filter) return true;
          return el.fieldName.toLowerCase().includes(filter.toLowerCase());
        });
    }, [fields, filter]);

    // Handle checkbox change
    const handleHiddenChange = (record: SqlFieldWithKey, checked: boolean) => {
      record.hidden = checked;
    };

    // Table columns
    const columns: ColumnsType<SqlFieldWithKey> = [
      {
        title: 'Deleted',
        key: 'hidden',
        width: 140,
        render: (_, record) => (
          <Checkbox
            checked={record.hidden}
            onChange={(e) => handleHiddenChange(record, e.target.checked)}
          />
        ),
      },
      {
        title: 'Field Name',
        dataIndex: 'fieldName',
        key: 'fieldName',
      },
      {
        title: 'Field Key',
        dataIndex: 'fieldKey',
        key: 'fieldKey',
      },
    ];

    return (
      <Modal
        title="Restore Fields"
        open={visible}
        onCancel={() => setVisible(false)}
        width="80%"
        footer={[
          <Button key="close" onClick={() => setVisible(false)}>
            Close
          </Button>,
        ]}
        maskClosable={false}
      >
        <div className="hidden-fields-actions">
          <Input
            placeholder="Filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ width: 250, marginBottom: 10 }}
          />
        </div>
        <Table
          columns={columns}
          dataSource={filteredFields}
          rowKey="fieldKey"
          bordered
          pagination={false}
        />
      </Modal>
    );
  }
);

HiddenFieldsPopUp.displayName = 'HiddenFieldsPopUp';

export default HiddenFieldsPopUp;

