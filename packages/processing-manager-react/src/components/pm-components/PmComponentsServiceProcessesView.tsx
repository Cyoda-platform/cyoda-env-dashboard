/**
 * PM Components Service Processes View
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabPmComponents/PmShardsDetailTabPmComponentsServiceProcessesView.vue
 */

import React, { useState, useEffect } from 'react';
import { Divider } from 'antd';
import { PmComponentsServiceProcessesViewReady } from './PmComponentsServiceProcessesViewReady';
import { PmComponentsServiceProcessesViewNoneReady } from './PmComponentsServiceProcessesViewNoneReady';
import { useLoadServiceProcessesStats } from '../../hooks';
import './PmComponentsServiceProcessesView.scss';

export const PmComponentsServiceProcessesView: React.FC = () => {
  const [ready, setReady] = useState([]);
  const [noneReady, setNoneReady] = useState([]);

  const { data } = useLoadServiceProcessesStats();

  useEffect(() => {
    if (data) {
      setReady(data.ready || []);
      setNoneReady(data.noneReady || []);
    }
  }, [data]);

  return (
    <div>
      <PmComponentsServiceProcessesViewReady tableData={ready} className="ready" />
      <Divider className="delimiter" />
      <PmComponentsServiceProcessesViewNoneReady tableData={noneReady} className="not-ready" />
    </div>
  );
};

export default PmComponentsServiceProcessesView;

