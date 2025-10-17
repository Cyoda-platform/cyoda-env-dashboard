import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Modal, Alert, Button, Space, message } from 'antd';
import Editor from '@monaco-editor/react';
import type { EntityMappingConfigDto, MappingConfigDto } from '../../../types';
import ScriptEditorFields from './ScriptEditorFields';
import ScriptEditorFiles from './ScriptEditorFiles';
import ScriptEditorUsedScripts from './ScriptEditorUsedScripts';
import './ScriptEditorDialog.css';

export interface ScriptEditorDialogRef {
  open: (
    entityMapping: EntityMappingConfigDto,
    mappingConfig: MappingConfigDto,
    entityIndex: number
  ) => void;
}

interface ScriptEditorDialogProps {
  onSave?: (entityMapping: EntityMappingConfigDto) => void;
}

const ScriptEditorDialog = forwardRef<ScriptEditorDialogRef, ScriptEditorDialogProps>(
  ({ onSave }, ref) => {
    const [visible, setVisible] = useState(false);
    const [selectedEntityMapping, setSelectedEntityMapping] = useState<EntityMappingConfigDto | null>(null);
    const [mappingConfig, setMappingConfig] = useState<MappingConfigDto | null>(null);
    const [entityIndex, setEntityIndex] = useState(0);
    const [scriptBody, setScriptBody] = useState('');
    const [scriptErrors, setScriptErrors] = useState<string[]>([]);
    const [allScriptsData, setAllScriptsData] = useState<any>({});
    const [isSaveBtnTouched, setIsSaveBtnTouched] = useState(false);
    const [editorHeight, setEditorHeight] = useState(400);
    const editorContainerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      open: (entityMapping, config, index) => {
        setSelectedEntityMapping(JSON.parse(JSON.stringify(entityMapping)));
        setMappingConfig(config);
        setEntityIndex(index);
        setScriptBody(entityMapping.script?.body || '');
        setScriptErrors([]);
        setAllScriptsData({});
        setIsSaveBtnTouched(false);
        setVisible(true);
      },
    }));

    useEffect(() => {
      if (editorContainerRef.current) {
        const resizeObserver = new ResizeObserver((entries) => {
          const entry = entries[0];
          if (entry) {
            setEditorHeight(entry.contentRect.height);
          }
        });
        resizeObserver.observe(editorContainerRef.current);
        return () => resizeObserver.disconnect();
      }
    }, [visible]);

    const handleClose = () => {
      setVisible(false);
      setSelectedEntityMapping(null);
      setMappingConfig(null);
    };

    const handleSave = () => {
      setIsSaveBtnTouched(true);

      if (!selectedEntityMapping) return;

      // Update script body
      if (selectedEntityMapping.script) {
        selectedEntityMapping.script.body = scriptBody;
      }

      // Validate
      const errors: string[] = [];
      // Add validation logic here if needed

      if (errors.length > 0) {
        message.error('Please fix errors before saving');
        return;
      }

      onSave?.(selectedEntityMapping);
      message.success('Script saved successfully');
      handleClose();
    };

    const handleScriptBodyChange = (value: string | undefined) => {
      setScriptBody(value || '');
      if (selectedEntityMapping?.script) {
        selectedEntityMapping.script.body = value || '';
      }
    };

    const handleScriptErrors = (errors: string[]) => {
      setScriptErrors(errors);
    };

    const handleScriptsData = (data: any) => {
      setAllScriptsData(data);
    };

    const hasScriptErrors = () => {
      if (allScriptsData.linksErrors && Object.keys(allScriptsData.linksErrors).length > 0) return true;
      if (allScriptsData.structureErrors && Object.keys(allScriptsData.structureErrors).length > 0) return true;
      return false;
    };

    if (!selectedEntityMapping) return null;

    return (
      <Modal
        title="Content Script Editor"
        open={visible}
        onCancel={handleClose}
        width="90%"
        maskClosable={false}
        footer={[
          <Button key="close" onClick={handleClose}>
            Close
          </Button>,
          <Button key="save" type="primary" onClick={handleSave}>
            OK
          </Button>,
        ]}
      >
        {visible && (
          <div className="script-editor-dialog">
            {isSaveBtnTouched && scriptErrors.length > 0 && (
              <Alert
                message="Errors!"
                description={
                  <ol>
                    {scriptErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ol>
                }
                type="error"
                showIcon
                closable={false}
                style={{ marginBottom: 16 }}
              />
            )}

            {scriptErrors.length > 0 && (
              <Alert
                message="Warning"
                description={`Not all scripts can be found. Not found ${scriptErrors.length} script(s)`}
                type="warning"
                showIcon
                closable={false}
                style={{ marginBottom: 16 }}
              />
            )}

            {hasScriptErrors() && (
              <Alert
                message="Script Errors"
                description="Some scripts have errors. Please check the script files."
                type="error"
                showIcon
                closable={false}
                style={{ marginBottom: 16 }}
              />
            )}

            <div className="script-editor-content">
              <div className="script-editor-sidebar">
                <ScriptEditorFiles
                  script={selectedEntityMapping.script}
                  onScriptsData={handleScriptsData}
                />
                <ScriptEditorFields script={selectedEntityMapping.script} />
              </div>

              <div className="script-editor-main">
                <ScriptEditorUsedScripts
                  script={selectedEntityMapping.script}
                  onScriptErrors={handleScriptErrors}
                />

                <div className="script-editor-hint">function mapping(input, entity) {'{'}</div>

                <div ref={editorContainerRef} className="script-editor-monaco">
                  <Editor
                    height={`${editorHeight}px`}
                    defaultLanguage="javascript"
                    value={scriptBody}
                    onChange={handleScriptBodyChange}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                    }}
                  />
                </div>

                <div className="script-editor-hint">{'}'}</div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    );
  }
);

ScriptEditorDialog.displayName = 'ScriptEditorDialog';

export default ScriptEditorDialog;

