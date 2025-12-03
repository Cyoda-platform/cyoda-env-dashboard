/**
 * HistoryFilter Component
 * Migrated from: .old_project/packages/http-api/src/views/History/HistoryFilter.vue
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Form, Select, DatePicker, Row, Col, Input } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { axios, useGlobalUiSettingsStore, usersList } from '@cyoda/http-api-react';
import dayjs, { Dayjs } from 'dayjs';
import type { HistoryFilterForm } from '../utils/HelperReportDefinition';
import HelperReportDefinition from '../utils/HelperReportDefinition';
import { HelperStorage } from '@cyoda/ui-lib-react';
import './HistoryFilter.scss';

interface HistoryFilterProps {
  value?: HistoryFilterForm;
  onChange?: (filter: HistoryFilterForm) => void;
  usersOptions?: { value: string; label: string }[];
  entityOptions?: { value: string; label: string }[];
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

const HistoryFilter: React.FC<HistoryFilterProps> = ({
  value,
  onChange,
  usersOptions: propUsersOptions,
  entityOptions: propEntityOptions,
}) => {
  const storage = useMemo(() => new HelperStorage(), []);
  const [form] = Form.useForm();

  // Get global entity type
  const { entityType } = useGlobalUiSettingsStore();

  // Initialize form with saved or default values
  const initialFilter = useMemo(() => {
    return storage.get<HistoryFilterForm>(
      'historyReports:filterForm',
      HelperReportDefinition.reportHistoryDefaultFilter()
    ) || HelperReportDefinition.reportHistoryDefaultFilter();
  }, [storage]);

  const [filterForm, setFilterForm] = useState<HistoryFilterForm>(value || initialFilter);

  // Load report definitions to get users and types (same as ReportConfigs)
  const { data: definitions = [] } = useQuery({
    queryKey: ['reportDefinitions'],
    queryFn: async () => {
      try {
        const { data } = await axios.get<{ _embedded: { gridConfigFieldsViews: GridConfigFieldsView[] } }>(
          '/platform-api/reporting/definitions',
          {
            params: {
              fields: ['id', 'description', 'type', 'userId', 'creationDate'],
              size: 999,
            },
          }
        );
        const defs = data._embedded?.gridConfigFieldsViews || [];

        // Get unique user IDs from definitions
        const userIds = [...new Set(
          defs
            .map((def) => def.gridConfigFields.userId)
            .filter((id): id is string => !!id)
        )];

        // Load user information if there are user IDs
        if (userIds.length > 0) {
          try {
            const { data: usersData } = await usersList(userIds);
            // Attach user info to definitions
            return defs.map((def) => ({
              ...def,
              gridConfigFields: {
                ...def.gridConfigFields,
                user: usersData.find((user) => user.userId === def.gridConfigFields.userId),
              },
            }));
          } catch (error) {
            console.error('Failed to load users:', error);
            return defs;
          }
        }

        return defs;
      } catch (error) {
        console.error('Failed to load report definitions:', error);
        return [];
      }
    },
  });

  // Load report types
  const { data: reportTypes = [] } = useQuery({
    queryKey: ['reportTypes', entityType],
    queryFn: async () => {
      try {
        const { data } = await axios.get<{ _embedded: { strings: string[] } }>(
          '/platform-api/reporting/types',
          {
            params: { entityType },
          }
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

  // Extract unique users from definitions (only if not provided via props)
  const usersOptions = useMemo(() => {
    if (propUsersOptions && propUsersOptions.length > 0) {
      return propUsersOptions;
    }

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
  }, [definitions, propUsersOptions]);

  // Entity options - extract from definitions (like ReportConfigs does)
  const entityOptions = useMemo(() => {
    if (propEntityOptions && propEntityOptions.length > 0) {
      return propEntityOptions;
    }

    const entities = definitions.map((report) => ({
      value: report.gridConfigFields.type,
      label: report.gridConfigFields.type,
    }));

    // Remove duplicates
    return Array.from(
      new Map(entities.map((e) => [e.value, e])).values()
    );
  }, [definitions, propEntityOptions]);

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
      entities: allValues.entities || [],
      time_custom: allValues.time_custom ? allValues.time_custom.toDate() : null,
      search: allValues.search || '',
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
      entities: filterForm.entities,
      time_custom: filterForm.time_custom ? dayjs(filterForm.time_custom) : null,
      search: filterForm.search,
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
          <Col span={8}>
            <Form.Item label="Author or Group:" name="authors">
              <Select
                mode="multiple"
                allowClear
                showSearch
                placeholder="Select"
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={usersOptions}
                classNames={{ popup: { root: 'history-filter-dropdown' } }}
                styles={{ popup: { root: { minWidth: '400px' } } }}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Entity:" name="entities">
              <Select
                mode="multiple"
                allowClear
                showSearch
                placeholder="Select"
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={entityOptions}
                classNames={{ popup: { root: 'history-filter-dropdown' } }}
                styles={{ popup: { root: { minWidth: '400px' } } }}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
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
          <Col span={24}>
            <Form.Item label="Search:" name="search">
              <Input
                placeholder="Search Report name and description here..."
                allowClear
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default HistoryFilter;

