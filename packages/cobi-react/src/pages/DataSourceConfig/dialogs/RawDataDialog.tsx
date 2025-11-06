import React, { useMemo } from 'react';
import { Drawer, Button, Alert, Space, message } from 'antd';
import { DownloadOutlined, CopyOutlined } from '@ant-design/icons';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup';

interface RawDataDialogProps {
  visible: boolean;
  content: string;
  onClose: () => void;
}

const RawDataDialog: React.FC<RawDataDialogProps> = ({
  visible,
  content,
  onClose,
}) => {
  // Detect content type
  const contentType = useMemo(() => {
    if (!content) return 'text';
    
    const trimmed = content.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        JSON.parse(trimmed);
        return 'json';
      } catch {
        return 'text';
      }
    } else if (trimmed.startsWith('<')) {
      return 'xml';
    }
    return 'text';
  }, [content]);

  // Format and highlight content
  const highlightedContent = useMemo(() => {
    if (!content) return '';

    try {
      if (contentType === 'json') {
        const parsed = JSON.parse(content);
        const formatted = JSON.stringify(parsed, null, 2);
        return Prism.highlight(formatted, Prism.languages.json, 'json');
      } else if (contentType === 'xml') {
        return Prism.highlight(content, Prism.languages.markup, 'markup');
      }
      return content;
    } catch {
      return content;
    }
  }, [content, contentType]);

  const isEmpty = !content || content === '{}' || content === '';

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    message.success('Content copied to clipboard!');
  };

  const handleDownload = () => {
    const extension = contentType === 'json' ? 'json' : contentType === 'xml' ? 'xml' : 'txt';
    const filename = `raw-data-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${extension}`;
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    message.success('File downloaded successfully!');
  };

  return (
    <Drawer
      title="Raw Data"
      placement="right"
      open={visible}
      onClose={onClose}
      width="50%"
      extra={
        !isEmpty && (
          <Space>
            <Button icon={<CopyOutlined />} onClick={handleCopy}>
              Copy
            </Button>
            <Button icon={<DownloadOutlined />} onClick={handleDownload} type="primary">
              Download
            </Button>
          </Space>
        )
      }
    >
      {isEmpty ? (
        <Alert
          message="No Data"
          description="We have not received any content for display"
          type="warning"
          showIcon
        />
      ) : (
        <pre
          className={`language-${contentType}`}
          style={{
            maxHeight: 'calc(100vh - 140px)',
            overflow: 'auto',
            backgroundColor: '#f5f5f5',
            padding: '16px',
            borderRadius: '4px',
          }}
        >
          <code
            className={`language-${contentType}`}
            dangerouslySetInnerHTML={{ __html: highlightedContent }}
          />
        </pre>
      )}
    </Drawer>
  );
};

export default RawDataDialog;

