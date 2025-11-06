import React from 'react';
import './DataSourceConfigDialogResultTabsStatistics.css';

interface DataSourceConfigDialogResultTabsStatisticsProps {
  data: any[];
}

const DataSourceConfigDialogResultTabsStatistics: React.FC<DataSourceConfigDialogResultTabsStatisticsProps> = ({ data }) => {
  return (
    <div className="data-source-config-dialog-result-tabs-statistics">
      {data.map((statistic, index) => (
        <div key={index}>
          <h3>Statistic: № {index + 1}</h3>
          {Object.keys(statistic).map((key) => (
            <div key={key} className="row">
              <div className="name">{key}:</div>
              <div className="value">{String(statistic[key])}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default DataSourceConfigDialogResultTabsStatistics;

