import React, { useState, useMemo } from 'react';
import { Alert, Button, Divider } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import beautify from 'js-beautify';
import { DiffEditor } from '@monaco-editor/react';
import './BlocklyResults.css';

interface DiffItem {
  generatedStatements: any;
  existStatements: any;
  dataMappingName: string;
  dstPath: string;
}

interface BlocklyResultsProps {
  diffsArray: DiffItem[];
}

const BlocklyResults: React.FC<BlocklyResultsProps> = ({ diffsArray }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentValue = useMemo(() => {
    return diffsArray[currentIndex];
  }, [diffsArray, currentIndex]);

  const oldString = useMemo(() => {
    if (!currentValue) return '';
    return beautify.js(JSON.stringify(currentValue.existStatements).trim(), {
      indent_size: 2,
      space_in_empty_paren: true,
      wrap_line_length: 50,
    });
  }, [currentValue]);

  const newString = useMemo(() => {
    if (!currentValue) return '';
    return beautify.js(JSON.stringify(currentValue.generatedStatements).trim(), {
      indent_size: 2,
      space_in_empty_paren: true,
      wrap_line_length: 50,
    });
  }, [currentValue]);

  const dataMappingName = useMemo(() => {
    if (!currentValue) return '';
    return currentValue.dataMappingName;
  }, [currentValue]);

  const dstPath = useMemo(() => {
    if (!currentValue) return '';
    return currentValue.dstPath;
  }, [currentValue]);

  const isDisabledPrev = currentIndex === 0;
  const isDisabledNext = currentIndex >= diffsArray.length - 1;

  const onPrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const onNext = () => {
    setCurrentIndex((prev) => Math.min(diffsArray.length - 1, prev + 1));
  };

  if (diffsArray.length === 0) {
    return (
      <div className="blockly-results">
        <Alert
          message="All is good"
          description="All generated texts same as statements from json"
          type="success"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="blockly-results">
      <p>
        <strong>Name:</strong> {dataMappingName}
      </p>
      <p>
        <strong>DstPath:</strong> {dstPath}
      </p>
      <p>
        Show {currentIndex + 1} from {diffsArray.length}
      </p>
      <p>
        <Button.Group>
          <Button
            disabled={isDisabledPrev}
            onClick={onPrev}
            type="primary"
            icon={<LeftOutlined />}
          >
            Previous
          </Button>
          <Button
            disabled={isDisabledNext}
            onClick={onNext}
            type="primary"
          >
            Next
            <RightOutlined />
          </Button>
        </Button.Group>
      </p>
      <Divider />

      <div className="code-diff-title">
        <div className="left">
          <h3>Generated</h3>
        </div>
        <div className="right">
          <h3>From Server</h3>
        </div>
      </div>

      <DiffEditor
        height="500px"
        language="javascript"
        original={oldString}
        modified={newString}
        options={{
          readOnly: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
        }}
      />
    </div>
  );
};

export default BlocklyResults;

