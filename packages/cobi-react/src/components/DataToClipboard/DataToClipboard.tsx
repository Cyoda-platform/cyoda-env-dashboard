import React from 'react';
import { Button, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import './DataToClipboard.css';

interface DataToClipboardProps {
  value: string;
}

const DataToClipboard: React.FC<DataToClipboardProps> = ({ value }) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      message.success('Copied to clipboard!');
    } catch (err) {
      message.error('Failed to copy to clipboard');
    }
  };

  return (
    <span className="data-to-clipboard">
      <code>{value}</code>
      <Button
        type="link"
        size="small"
        icon={<CopyOutlined />}
        onClick={handleCopy}
        title="Copy to clipboard"
      />
    </span>
  );
};

export default DataToClipboard;

