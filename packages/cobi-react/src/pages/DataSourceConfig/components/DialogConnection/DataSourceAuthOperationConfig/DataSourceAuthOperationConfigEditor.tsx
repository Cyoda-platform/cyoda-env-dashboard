import React, { useState, useEffect } from 'react';
import { Alert, Button } from 'antd';
import Editor from '@monaco-editor/react';
import './DataSourceAuthOperationConfigEditor.css';

interface DataSourceAuthOperationConfigEditorProps {
  dataSourceAuthRespConfig: any;
  onChange?: (config: any) => void;
}

const DataSourceAuthOperationConfigEditor: React.FC<DataSourceAuthOperationConfigEditorProps> = ({
  dataSourceAuthRespConfig,
  onChange,
}) => {
  const [jsonData, setJsonData] = useState('');
  const [isValidJson, setIsValidJson] = useState(true);

  useEffect(() => {
    // Initialize JSON data from config
    let jsonDataValue: any = JSON.parse(JSON.stringify(dataSourceAuthRespConfig.responseParamToPathMap || {}));
    const rootKey = Object.keys(jsonDataValue)[0];

    if (jsonDataValue && rootKey && jsonDataValue[rootKey]?.dtoName) {
      const dtoName = jsonDataValue[rootKey].dtoName;
      delete jsonDataValue[rootKey].dtoName;
      jsonDataValue[rootKey] = {
        '@bean': dtoName,
        ...jsonDataValue[rootKey],
      };
    }

    const prettyJson = JSON.stringify(jsonDataValue, null, 2);
    setJsonData(prettyJson);
  }, [dataSourceAuthRespConfig.responseParamToPathMap]);

  const handleEditorChange = (value: string | undefined) => {
    if (!value) {
      setJsonData('');
      setIsValidJson(true);
      return;
    }

    setJsonData(value);

    try {
      const parsed = JSON.parse(value);
      setIsValidJson(true);

      if (onChange) {
        onChange({
          ...dataSourceAuthRespConfig,
          responseParamToPathMap: parsed,
        });
      }
    } catch (e) {
      setIsValidJson(false);
    }
  };

  const onBeautify = () => {
    try {
      const parsed = JSON.parse(jsonData);
      const pretty = JSON.stringify(parsed, null, 2);
      setJsonData(pretty);
      setIsValidJson(true);
    } catch (e) {
      // Invalid JSON, can't beautify
    }
  };

  return (
    <div className="data-source-auth-operation-config-editor">
      <div className="inner">
        <div className="label">Response Param To Path Map</div>
        <div className="editor">
          {!isValidJson && jsonData && (
            <Alert
              message="Error"
              description="Content is not valid JSON"
              type="error"
              showIcon
              style={{ marginBottom: 10 }}
            />
          )}
          <div className="actions-body-template">
            <Button type="link" onClick={onBeautify} className="btn-beautify">
              Beautify
            </Button>
          </div>
          <Editor
            height="400px"
            language="json"
            value={jsonData}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 14,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default DataSourceAuthOperationConfigEditor;

