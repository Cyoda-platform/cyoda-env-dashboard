import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Modal, Button, Alert, Spin } from 'antd';
import FunctionalMappingEditor, { FunctionalMappingEditorRef } from './FunctionalMappingEditor';
import BlocklyResults from './BlocklyResults';
import { useDataMappingApi } from '../../../api/dataMappingApi';
import type { MappingConfigDto, EntityMappingConfigDto, FunctionalMappingConfigDto } from '../../../types';
import './BlocklyDialog.css';

interface DiffItem {
  generatedStatements: any;
  existStatements: any;
  dataMappingName: string;
  dstPath: string;
}

export interface BlocklyDialogRef {
  open: () => void;
}

const BlocklyDialog = forwardRef<BlocklyDialogRef, {}>((props, ref) => {
  const [visible, setVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [dataMappings, setDataMappings] = useState<MappingConfigDto[]>([]);
  const [diffsArray, setDiffsArray] = useState<DiffItem[]>([]);
  const [taskDone, setTaskDone] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const functionalMappingEditorRef = useRef<FunctionalMappingEditorRef>(null);
  const { getListAllDataMappings } = useDataMappingApi();

  const isFinish = taskDone === dataMappings.length;
  const isShowBlocklyResults = isFinish && dataMappings.length > 0;

  // Initialize and load data
  const initializeBlockly = async () => {
    try {
      setIsLoading(true);
      setLogs(['Loading data mappings...']);
      
      const { data } = await getListAllDataMappings();
      setDataMappings(data);
      setLogs((prev) => [...prev, 'Got all data mappings configs']);

      setTimeout(async () => {
        setIsLoading(false);
        if (!functionalMappingEditorRef.current) return;

        await functionalMappingEditorRef.current.initAllFunctions();
        await functionalMappingEditorRef.current.initListTransformers();
        await functionalMappingEditorRef.current.initListAllDictionaries();

        // Small delay to ensure everything is initialized
        setTimeout(() => {
          functionalMappingEditorRef.current?.addBlockly();
          startCheck(data);
        }, 100);
      }, 2000);
    } catch (e: any) {
      setIsLoading(false);
      setError(e.message || 'Failed to load data mappings');
    }
  };

  // Start checking all data mappings
  const startCheck = async (mappings: MappingConfigDto[]) => {
    setLogs((prev) => [...prev, 'Start to check']);
    const diffs: DiffItem[] = [];

    for (let i = 0; i < mappings.length; i++) {
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          setLogs((prev) => {
            const newLogs = [...prev];
            if (i > 0) newLogs.pop(); // Remove previous progress log
            newLogs.push(`Check ${i + 1} from ${mappings.length} and ${mappings[i].name}`);
            return newLogs;
          });
          setTaskDone(i + 1);

          const dataMapping = mappings[i];
          dataMapping.entityMappings?.forEach((entityMapping) => {
            entityMapping.functionalMappings?.forEach((functionalMapping) => {
              try {
                const result = runBlocklyTransform(dataMapping, entityMapping, functionalMapping);
                if (result) {
                  diffs.push(result);
                }
              } catch (e: any) {
                console.error(e);
                setError(e.message || 'Error during transformation');
              }
            });
          });

          resolve();
        }, 10);
      });
    }

    setDiffsArray(diffs);
  };

  // Run Blockly transformation
  const runBlocklyTransform = (
    dataMapping: MappingConfigDto,
    entityMapping: EntityMappingConfigDto,
    functionalMapping: FunctionalMappingConfigDto
  ): DiffItem | null => {
    if (!functionalMappingEditorRef.current) return null;

    const { generatedStatements, existStatements } = functionalMappingEditorRef.current.setContentToBlockly(
      JSON.parse(JSON.stringify(dataMapping)),
      JSON.parse(JSON.stringify(entityMapping)),
      JSON.parse(JSON.stringify(functionalMapping))
    );

    if (JSON.stringify(generatedStatements) !== JSON.stringify(existStatements)) {
      return {
        generatedStatements,
        existStatements,
        dataMappingName: dataMapping.name || '',
        dstPath: functionalMapping.dstPath || '',
      };
    }

    return null;
  };

  // Open dialog
  const open = () => {
    setVisible(true);
    setLogs([]);
    setDataMappings([]);
    setDiffsArray([]);
    setTaskDone(0);
    setError(null);
  };

  // Close dialog
  const handleClose = () => {
    setVisible(false);
  };

  // Initialize when dialog opens
  useEffect(() => {
    if (visible) {
      initializeBlockly();
    }
  }, [visible]);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    open,
  }));

  return (
    <Modal
      title="Blockly Tool"
      open={visible}
      onCancel={handleClose}
      width="90%"
      footer={[
        <Button key="close" onClick={handleClose}>
          Close
        </Button>,
      ]}
    >
      {!isFinish && (
        <Spin spinning={isLoading}>
          <div className="logs">
            {logs.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
          </div>
        </Spin>
      )}

      <div className="wrap-blockly">
        <FunctionalMappingEditor ref={functionalMappingEditorRef} />
      </div>

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          closable={false}
        />
      )}

      {isShowBlocklyResults && <BlocklyResults diffsArray={diffsArray} />}
    </Modal>
  );
});

BlocklyDialog.displayName = 'BlocklyDialog';

export default BlocklyDialog;

