import React from 'react';
import MonacoEditor from '@monaco-editor/react';

interface DataSourceConfigDialogResultTabsRawJSONResponseProps {
  data: any;
}

const DataSourceConfigDialogResultTabsRawJSONResponse: React.FC<DataSourceConfigDialogResultTabsRawJSONResponseProps> = ({ data }) => {
  const jsonString = JSON.stringify(data, null, 2);

  return (
    <div style={{ height: '500px', border: '1px solid #d9d9d9' }}>
      <MonacoEditor
        height="100%"
        language="json"
        value={jsonString}
        options={{
          readOnly: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 13,
        }}
      />
    </div>
  );
};

export default DataSourceConfigDialogResultTabsRawJSONResponse;

