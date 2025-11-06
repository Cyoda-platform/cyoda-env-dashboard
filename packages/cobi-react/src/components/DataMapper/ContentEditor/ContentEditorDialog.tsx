import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Modal, Alert, Button, message } from 'antd';
import Editor from '@monaco-editor/react';
import './ContentEditorDialog.css';

export interface ContentEditorDialogRef {
  open: (content: string, dataType: string) => void;
}

interface ContentEditorDialogProps {
  onSave?: (content: string) => void;
}

const ContentEditorDialog = forwardRef<ContentEditorDialogRef, ContentEditorDialogProps>(
  ({ onSave }, ref) => {
    const [visible, setVisible] = useState(false);
    const [content, setContent] = useState('');
    const [dataType, setDataType] = useState('JSON');
    const [isSaveBtnTouched, setIsSaveBtnTouched] = useState(false);

    useImperativeHandle(ref, () => ({
      open: (initialContent: string, type: string) => {
        setContent(initialContent);
        setDataType(type);
        setIsSaveBtnTouched(false);
        setVisible(true);
      },
    }));

    const getLanguage = () => {
      if (dataType === 'JSON') return 'json';
      if (dataType === 'XML') return 'xml';
      if (dataType === 'CSV') return 'plaintext';
      return 'plaintext';
    };

    const validateContent = (): string[] => {
      const errors: string[] = [];
      
      if (dataType === 'JSON') {
        try {
          JSON.parse(content);
        } catch (e) {
          errors.push('Content is not valid JSON');
        }
      } else if (dataType === 'XML') {
        try {
          const parser = new DOMParser();
          const doc = parser.parseFromString(content, 'text/xml');
          const parserError = doc.querySelector('parsererror');
          if (parserError) {
            errors.push('Content is not valid XML');
          }
        } catch (e) {
          errors.push('Content is not valid XML');
        }
      }
      
      return errors;
    };

    const errors = validateContent();
    const fileSize = Math.ceil(content.length / 1024);

    const handleSave = () => {
      setIsSaveBtnTouched(true);
      
      if (errors.length === 0) {
        onSave?.(content);
        message.success('Content saved successfully');
        setVisible(false);
      } else {
        message.error('Editor has errors!');
      }
    };

    const handleClose = () => {
      setVisible(false);
      setIsSaveBtnTouched(false);
    };

    return (
      <Modal
        title="Content Editor"
        open={visible}
        onCancel={handleClose}
        width="90%"
        footer={[
          <Button key="close" onClick={handleClose}>
            Close
          </Button>,
          <Button key="save" type="primary" onClick={handleSave}>
            OK
          </Button>,
        ]}
        className="content-editor-dialog"
      >
        <div className="content-editor-container">
          {errors.length > 0 && isSaveBtnTouched && (
            <Alert
              message="Errors!"
              description={
                <div>
                  Editor contains several errors:
                  <ol>
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ol>
                </div>
              }
              type="error"
              showIcon
              closable={false}
              style={{ marginBottom: 16 }}
            />
          )}
          
          <Editor
            height="500px"
            language={getLanguage()}
            value={content}
            onChange={(value) => setContent(value || '')}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
          
          <div className="content-info">
            <strong>Content size:</strong> {fileSize}kb
          </div>
        </div>
      </Modal>
    );
  }
);

ContentEditorDialog.displayName = 'ContentEditorDialog';

export default ContentEditorDialog;

