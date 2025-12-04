import React, { useMemo } from 'react';
import { Modal } from 'antd';
import { CodeEditor } from '@cyoda/ui';

interface CompareDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  compareData: {
    oldData: Record<string, any>;
    newData: Record<string, any>;
  } | null;
}

export const CompareDataDialog: React.FC<CompareDataDialogProps> = ({
  open,
  onOpenChange,
  compareData,
}) => {
  const getDataForDisplay = (data: Record<string, any> | null): string => {
    if (!data) return '';
    
    // Convert object to YAML-like format for better readability
    const entries = Object.entries(data).map(([key, value]) => {
      if (value === null) return `${key}: null`;
      if (typeof value === 'object') return `${key}: ${JSON.stringify(value)}`;
      return `${key}: ${value}`;
    });
    
    return entries.join('\n');
  };

  // Memoize the strings to prevent recreation on every render
  const oldStr = useMemo(() => {
    const result = getDataForDisplay(compareData?.oldData || null);
    console.log('CompareDataDialog: oldStr =', result);
    return result;
  }, [compareData?.oldData]);

  const newStr = useMemo(() => {
    const result = getDataForDisplay(compareData?.newData || null);
    console.log('CompareDataDialog: newStr =', result);
    return result;
  }, [compareData?.newData]);

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Modal
      title="Compare Data"
      open={open}
      onCancel={handleClose}
      width="80%"
      footer={null}
      maskClosable={false}
      className="data-lineage-compare"
    >
      <div className="compare-content">
        <CodeEditor
          diff={true}
          oldString={oldStr}
          newString={newStr}
          language="plain"
          diffReadonly={true}
          height="500px"
        />
      </div>
    </Modal>
  );
};
