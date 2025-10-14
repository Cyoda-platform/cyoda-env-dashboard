/**
 * PM Components Execution Monitors
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabPmComponents/PmShardsDetailTabPmComponentsExecutionMonitors.vue
 */

import React, { useState, useMemo, useEffect } from 'react';
import { PmComponentsExecutionMonitorsFilter } from './PmComponentsExecutionMonitorsFilter';
import { PmComponentsExecutionMonitorsTable } from './PmComponentsExecutionMonitorsTable';
import { useExecMonitorsInfo } from '../../hooks';

interface FilterForm {
  name: string;
  updateInterval: number;
}

export const PmComponentsExecutionMonitors: React.FC = () => {
  const [form, setForm] = useState<FilterForm>({ name: '', updateInterval: 2 });
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const { data, refetch } = useExecMonitorsInfo();

  const tableData = useMemo(() => {
    if (!data?.data) return [];
    return data.data.filter(
      (item: any) => !form.name || item.name.toLowerCase().includes(form.name.toLowerCase())
    );
  }, [data, form.name]);

  const handleFilter = (newForm: FilterForm) => {
    setForm(newForm);
    
    // Clear existing interval
    if (intervalId) {
      clearInterval(intervalId);
    }

    // Set up new interval
    const newIntervalId = setInterval(() => {
      refetch();
    }, newForm.updateInterval * 1000);
    
    setIntervalId(newIntervalId);
  };

  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  return (
    <div>
      <PmComponentsExecutionMonitorsFilter onFilter={handleFilter} />
      <PmComponentsExecutionMonitorsTable tableData={tableData} />
    </div>
  );
};

export default PmComponentsExecutionMonitors;

