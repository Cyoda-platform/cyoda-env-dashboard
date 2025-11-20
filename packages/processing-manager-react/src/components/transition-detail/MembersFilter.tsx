/**
 * Members Filter Component
 * Migrated from @cyoda/processing-manager/src/components/PmTransitionDetail/Members/MembersFilter.vue
 */

import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Form, Select, Button, Row, Col } from 'antd';
import { useEntitiesListPossible } from '../../hooks';
import './MembersFilter.scss';

interface FilterValues {
  entityType: string;
  actionType: string;
  versionCheckResult: boolean | null;
  sort: string;
}

interface MembersFilterProps {
  isLoading?: boolean;
  onChange?: (values: FilterValues) => void;
}

export interface MembersFilterRef {
  form: FilterValues;
}

export const MembersFilter = forwardRef<MembersFilterRef, MembersFilterProps>(
  ({ isLoading = false, onChange }, ref) => {
    const [form, setForm] = useState<FilterValues>({
      entityType: '',
      actionType: 'ALL',
      versionCheckResult: null,
      sort: 'ASC',
    });

    const { data: entityClassesData } = useEntitiesListPossible();

    const entityClassOptions = Array.isArray(entityClassesData)
      ? entityClassesData.map((el: string) => ({
          label: el,
          value: el,
        }))
      : [];

    const actionTypeOptions = ['ALL', 'READ', 'UPDATE', 'REMOVE'];

    useImperativeHandle(ref, () => ({
      form,
    }));

    const handleSubmit = () => {
      onChange?.(form);
    };

    const handleFieldChange = (field: keyof FilterValues, value: any) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    };

    return (
      <div className="members-filter-wrapper">
        <h3 className="filter-title">Filter</h3>
        <Form layout="vertical" className="members-filter">
          <Row gutter={20} className="wrap-row">
            <Col span={5}>
              <Form.Item label="ENTITY TYPE">
                <Select
                  showSearch
                  allowClear
                  value={form.entityType}
                  onChange={(value) => handleFieldChange('entityType', value || '')}
                  options={entityClassOptions}
                  popupMatchSelectWidth={false}
                />
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item label="ACTION TYPE">
                <Select
                  value={form.actionType}
                  onChange={(value) => handleFieldChange('actionType', value)}
                  options={actionTypeOptions.map((a) => ({ value: a, label: a }))}
                  placeholder="Action Type"
                  popupMatchSelectWidth={false}
                />
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item label="VERSION CHECK RESULT">
                <Select
                  allowClear
                  value={form.versionCheckResult}
                  onChange={(value) => handleFieldChange('versionCheckResult', value)}
                  options={[
                    { label: 'True', value: true },
                    { label: 'False', value: false },
                  ]}
                  placeholder="Please select"
                  popupMatchSelectWidth={false}
                />
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item label="SORT">
                <Select
                  value={form.sort}
                  onChange={(value) => handleFieldChange('sort', value)}
                  options={[
                    { label: 'Asc', value: 'ASC' },
                    { label: 'Desc', value: 'DESC' },
                  ]}
                  placeholder="Sort"
                  popupMatchSelectWidth={false}
                />
              </Form.Item>
            </Col>
            <Col span={4} className="action-item">
              <Button type="primary" onClick={handleSubmit} loading={isLoading}>
                Load
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
);

MembersFilter.displayName = 'MembersFilter';

export default MembersFilter;

