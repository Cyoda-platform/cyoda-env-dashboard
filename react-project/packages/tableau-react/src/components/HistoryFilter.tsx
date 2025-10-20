/**
 * HistoryFilter Component
 * Migrated from: .old_project/packages/http-api/src/views/History/HistoryFilter.vue
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Form, Select, DatePicker, Row, Col } from 'antd';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import dayjs, { Dayjs } from 'dayjs';
import type { HistoryFilterForm } from '../utils/HelperReportDefinition';
import HelperReportDefinition from '../utils/HelperReportDefinition';
import { HelperStorage } from '@cyoda/ui-lib-react';
import './HistoryFilter.scss';

const { Option } = Select;

interface HistoryFilterProps {
  value?: HistoryFilterForm;
  onChange?: (filter: HistoryFilterForm) => void;
}

interface ReportType {
  value: string;
  label: string;
}

interface GridConfigFieldsView {
  gridConfigFields: {
    description: string;
    id: string;
    groupingVersion: string;
    type: string;
    user?: {
      username: string;
    };
    userId?: string;
    creationDate: string;
  };
}

const HistoryFilter: React.FC<HistoryFilterProps> = ({ value, onChange }) => {
  const storage = useMemo(() => new HelperStorage(), []);
  const [form] = Form.useForm();

  // Initialize form with saved or default values
  const initialFilter = useMemo(() => {
    return storage.get<HistoryFilterForm>(
      'historyReports:filterForm',
      HelperReportDefinition.reportHistoryDefaultFilter()
    ) || HelperReportDefinition.reportHistoryDefaultFilter();
  }, [storage]);

  const [filterForm, setFilterForm] = useState<HistoryFilterForm>(value || initialFilter);

  // Load report definitions to get users and types
  const { data: definitions = [] } = useQuery({
    queryKey: ['reportDefinitions'],
    queryFn: async () => {
      try {
        const { data } = await axios.get<{ _embedded: { gridConfigFieldsViews: GridConfigFieldsView[] } }>(
          '/platform-api/reporting/definitions'
        );
        return data._embedded?.gridConfigFieldsViews || [];
      } catch (error) {
        console.error('Failed to load report definitions:', error);
        return [];
      }
    },
  });

  // Load report types
  const { data: reportTypes = [] } = useQuery({
    queryKey: ['reportTypes'],
    queryFn: async () => {
      try {
        const { data } = await axios.get<{ _embedded: { strings: string[] } }>(
          '/platform-api/reporting/types'
        );
        const types = data._embedded?.strings || [];
        return types.map((type) => ({
          value: type,
          label: type,
        }));
      } catch (error) {
        console.error('Failed to load report types:', error);
        return [];
      }
    },
  });

  // Extract unique users from definitions
  const usersOptions = useMemo(() => {
    const users = definitions
      .filter((report) => report.gridConfigFields.user)
      .map((report) => ({
        value: report.gridConfigFields.user!.username,
        label: report.gridConfigFields.user!.username,
      }));
    
    // Remove duplicates
    const uniqueUsers = Array.from(
      new Map(users.map((user) => [user.value, user])).values()
    );
    
    return uniqueUsers;
  }, [definitions]);

  // State options
  const stateOptions = useMemo(() => {
    const statuses = ['running', 'finished', 'failed', 'success', 'canceled'];
    return statuses.map((status) => ({
      value: status,
      label: HelperReportDefinition.capitalizeFirstLetter(status),
    }));
  }, []);

  // Time shortcuts for date picker
  const timeShortcuts = [
    {
      text: 'Past hour',
      value: () => dayjs().subtract(1, 'hour'),
    },
    {
      text: 'Past 24 hours',
      value: () => dayjs().subtract(24, 'hour'),
    },
    {
      text: 'Past week',
      value: () => dayjs().subtract(7, 'day'),
    },
    {
      text: 'Past month',
      value: () => dayjs().subtract(30, 'day'),
    },
    {
      text: 'Past year',
      value: () => dayjs().subtract(1, 'year'),
    },
  ];

  // Handle form changes
  const handleValuesChange = (_: any, allValues: any) => {
    const newFilter: HistoryFilterForm = {
      authors: allValues.authors || [],
      states: allValues.states || [],
      types: allValues.types || [],
      time_custom: allValues.time_custom ? allValues.time_custom.toDate() : null,
      entityType: allValues.entityType || 'BUSINESS',
    };

    setFilterForm(newFilter);
    storage.set('historyReports:filterForm', newFilter);
    onChange?.(newFilter);
  };

  // Set initial form values
  useEffect(() => {
    form.setFieldsValue({
      authors: filterForm.authors,
      states: filterForm.states,
      types: filterForm.types,
      time_custom: filterForm.time_custom ? dayjs(filterForm.time_custom) : null,
      entityType: filterForm.entityType,
    });
    
    // Emit initial value
    onChange?.(filterForm);
  }, []);

  // Disable future dates
  const disabledDate = (current: Dayjs) => {
    return current && current > dayjs().endOf('day');
  };

  return (
    <div className="history-filter">
      <h2>Filter</h2>
      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleValuesChange}
      >
        <Row gutter={20}>
          <Col span={12}>
            <Form.Item label="Author or Group:" name="authors">
              <Select
                mode="multiple"
                allowClear
                showSearch
                placeholder="Select authors"
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={usersOptions}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Filter by state:" name="states">
              <Select
                mode="multiple"
                allowClear
                showSearch
                placeholder="Select states"
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={stateOptions}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Types:" name="types">
              <Select
                mode="multiple"
                allowClear
                showSearch
                placeholder="Select types"
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={reportTypes}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="By date and time:" name="time_custom">
              <DatePicker
                showTime
                format="DD.MM.YYYY HH:mm:ss"
                placeholder="Select from date and time"
                disabledDate={disabledDate}
                presets={timeShortcuts.map((shortcut) => ({
                  label: shortcut.text,
                  value: shortcut.value(),
                }))}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default HistoryFilter;

