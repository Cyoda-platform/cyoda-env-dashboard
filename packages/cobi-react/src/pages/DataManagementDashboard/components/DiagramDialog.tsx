import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Modal, Form, Select, Alert } from 'antd';
import cytoscape from 'cytoscape';
import { getPipeline } from '../../../api/dataSourceConfigApi';
import GraphControls from './GraphControls';
import './DiagramDialog.css';

const { Option } = Select;

interface DataSourceConfigRow {
  id: string;
  name?: string;
}

interface PipelineData {
  possiblePipelineByOperationName: Record<string, any>;
  existAnyErrorsByOperationName: Record<string, boolean>;
}

export interface DiagramDialogRef {
  open: (row: DataSourceConfigRow) => void;
}

const DiagramDialog = forwardRef<DiagramDialogRef>((props, ref) => {
  const [visible, setVisible] = useState(false);
  const [operationName, setOperationName] = useState<string>('');
  const [pipeline, setPipeline] = useState<PipelineData | null>(null);
  const [options, setOptions] = useState<{ label: string; value: string }[]>([]);
  const [hasError, setHasError] = useState(false);

  const cyRef = useRef<any>(null);
  const cyDivRef = useRef<HTMLDivElement>(null);
  const errorIndexRef = useRef(0);

  useImperativeHandle(ref, () => ({
    open: async (row: DataSourceConfigRow) => {
      setVisible(true);
      await loadData(row);
    },
  }));

  const loadData = async (row: DataSourceConfigRow) => {
    try {
      const { data } = await getPipeline(row.id);
      setPipeline(data);

      // Set options
      const ops = Object.keys(data.possiblePipelineByOperationName).map((key) => ({
        label: key,
        value: key,
      }));
      setOptions(ops);

      // Set first operation as default
      if (ops.length > 0) {
        setOperationName(ops[0].value);
      }
    } catch (error) {
      console.error('Failed to load pipeline:', error);
    }
  };

  useEffect(() => {
    if (operationName && pipeline && cyDivRef.current) {
      renderDiagram();
    }
  }, [operationName, pipeline]);

  useEffect(() => {
    if (pipeline && operationName) {
      setHasError(pipeline.existAnyErrorsByOperationName[operationName] || false);
    }
  }, [pipeline, operationName]);

  const renderDiagram = () => {
    if (!pipeline || !operationName || !cyDivRef.current) return;

    const pipelineByOperationName = pipeline.possiblePipelineByOperationName[operationName];
    const elements: any[] = [];
    errorIndexRef.current = 0;

    buildElements(elements, pipelineByOperationName, 0);

    // Destroy previous instance
    if (cyRef.current) {
      cyRef.current.destroy();
    }

    cyRef.current = cytoscape({
      container: cyDivRef.current,
      elements,
      style: getCytoscapeStyles(),
      layout: {
        name: 'breadthfirst',
        fit: true,
        padding: 10,
        avoidOverlap: false,
        directed: true,
        nodeDimensionsIncludeLabels: true,
      },
    });

    cyRef.current.userZoomingEnabled(false);
    cyRef.current.nodes().ungrabify();
  };

  const buildElements = (elements: any[], pipelineByOperationName: any, index: number = 0) => {
    let configName = `Data Source Config Name\n${pipelineByOperationName.dataSourceConfigName}`;
    if (pipelineByOperationName.chainingConfigName) {
      configName = configName + `\nChaining Config Name: ${pipelineByOperationName.chainingConfigName}`;
    }

    const configNameWidth = pipelineByOperationName.dataSourceConfigName.length * 10;
    elements.push({
      classes: 'config-names',
      data: {
        id: `config-name${index}`,
        height: 40,
        width: configNameWidth > 170 ? configNameWidth : 170,
        text: configName,
      },
    });

    const operationWidth = operationName.length * 10;
    elements.push({
      classes: 'operations',
      data: {
        id: `operation${index}`,
        height: 40,
        width: operationWidth > 150 ? operationWidth : 150,
        text: `Operation Name\n${operationName}`,
      },
    });

    elements.push({
      data: {
        id: `config-name${index}operation${index}`,
        source: `config-name${index}`,
        target: `operation${index}`,
      },
    });

    if (pipelineByOperationName.dataSourceConsumer) {
      elements.push({
        classes: 'consumers',
        data: {
          id: `consumer${index}`,
          height: 50,
          width: pipelineByOperationName.dataSourceConsumer.relatedClasses.join(' ').length * 20,
          text:
            'Consumer: ' +
            pipelineByOperationName.dataSourceConsumer.configName +
            '\n' +
            `Related Classes: ${pipelineByOperationName.dataSourceConsumer.relatedClasses.join('\n')}`,
        },
      });

      elements.push({
        data: {
          id: `operation${index}consumer${index}`,
          source: `operation${index}`,
          target: `consumer${index}`,
        },
      });
    }

    if (pipelineByOperationName.chainings && pipelineByOperationName.chainings.length > 0) {
      const chaining = pipelineByOperationName.chainings[0];
      const chainingConfigWidth = chaining.chainingConfigName.length * 10;
      elements.push({
        classes: 'chainings',
        data: {
          id: `chaining${index}`,
          height: 40,
          width: chainingConfigWidth > 150 ? chainingConfigWidth : 150,
          text: `Chaining Config Name:\n${chaining.chainingConfigName}`,
        },
      });

      const source = pipelineByOperationName.dataSourceConsumer ? `consumer${index}` : `operation${index}`;
      elements.push({
        data: {
          id: `${source}chaining${index}`,
          source: source,
          target: `chaining${index}`,
        },
      });

      if (chaining.configHasError) {
        let errorWidth = chaining.errorMessage.length * 10;
        let errorMessage = chaining.errorMessage;
        let lines = 2;
        if (errorWidth < 150) errorWidth = 150;
        if (errorWidth > 300) {
          errorWidth = 300;
          const parts = errorMessage.match(/.{1,35}/g);
          lines = parts ? parts.length : 2;
          errorMessage = parts ? parts.join('\n') : errorMessage;
        }
        const errorId = `error${errorIndexRef.current++}`;
        elements.push({
          classes: 'error',
          data: {
            id: errorId,
            height: 20 * lines,
            width: errorWidth > 150 ? errorWidth : 150,
            text: `Error:\n${errorMessage}`,
          },
        });

        elements.push({
          data: {
            id: `chaining${index}${errorId}`,
            source: `chaining${index}`,
            target: errorId,
          },
        });
      }

      if (pipelineByOperationName.chainings[0].childPipeline) {
        elements.push({
          data: {
            id: `chaining${index}config-name${index + 1}`,
            source: `chaining${index}`,
            target: `config-name${index + 1}`,
          },
        });
        buildElements(elements, pipelineByOperationName.chainings[0].childPipeline, index + 1);
      }
    }
  };

  const getCytoscapeStyles = () => [
    {
      selector: '.config-names',
      style: {
        label: 'data(text)',
        height: 'data(height)',
        width: 'data(width)',
        'border-color': '#148751',
        'border-width': 2,
        shape: 'round-rectangle',
        'background-color': '#fff',
        'text-color': '#148751',
        'text-wrap': 'wrap',
        'font-size': 12,
        'text-halign': 'center',
        'text-valign': 'center',
        'font-weight': '500',
      },
    },
    {
      selector: '.operations',
      style: {
        label: 'data(text)',
        height: 'data(height)',
        width: 'data(width)',
        'border-color': '#148751',
        'border-width': 2,
        shape: 'round-rectangle',
        'background-color': '#fff',
        'text-color': '#1890ff',
        'text-wrap': 'wrap',
        'font-size': 12,
        'text-halign': 'center',
        'text-valign': 'center',
        'font-weight': '500',
      },
    },
    {
      selector: '.consumers',
      style: {
        label: 'data(text)',
        height: 'data(height)',
        width: 'data(width)',
        'border-color': '#148751',
        'border-width': 2,
        shape: 'round-rectangle',
        'background-color': '#fff',
        'text-color': '#722ed1',
        'text-wrap': 'wrap',
        'font-size': 12,
        'text-halign': 'center',
        'text-valign': 'center',
        'font-weight': '500',
      },
    },
    {
      selector: '.chainings',
      style: {
        label: 'data(text)',
        height: 'data(height)',
        width: 'data(width)',
        'border-color': '#148751',
        'border-width': 2,
        shape: 'round-rectangle',
        'background-color': '#fff',
        'text-color': '#fa8c16',
        'text-wrap': 'wrap',
        'font-size': 12,
        'text-halign': 'center',
        'text-valign': 'center',
        'font-weight': '500',
      },
    },
    {
      selector: '.error',
      style: {
        label: 'data(text)',
        height: 'data(height)',
        width: 'data(width)',
        'border-color': '#fbc4c4',
        'border-width': 2,
        shape: 'round-rectangle',
        'background-color': '#fef0f0',
        'text-color': '#f5222d',
        'text-wrap': 'wrap',
        'font-size': 12,
        'text-halign': 'center',
        'text-valign': 'center',
        'font-weight': '500',
      },
    },
    {
      selector: 'edge',
      style: {
        'line-style': 'dashed',
        label: 'data(title)',
        'text-background-color': '#f9fdfd',
        'text-background-opacity': 0.9,
        'line-color': '#F7AD11',
        'z-compound-depth': 'bottom',
        width: 3,
        'target-arrow-shape': 'triangle',
        'target-arrow-color': '#912624',
        'arrow-scale': 1.1,
        'curve-style': 'bezier',
        'control-point-step-size': 240,
      },
    },
  ];

  const handleClose = () => {
    setVisible(false);
    setPipeline(null);
    setOperationName('');
    setOptions([]);
    if (cyRef.current) {
      cyRef.current.destroy();
      cyRef.current = null;
    }
  };

  // Control handlers
  const fitGraph = () => cyRef.current?.fit();
  const zoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() + 0.1);
  const zoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() - 0.1);
  const panLeft = () => cyRef.current?.pan({ x: cyRef.current.pan().x - 50 });
  const panRight = () => cyRef.current?.pan({ x: cyRef.current.pan().x + 50 });
  const panTop = () => cyRef.current?.pan({ y: cyRef.current.pan().y - 50 });
  const panBottom = () => cyRef.current?.pan({ y: cyRef.current.pan().y + 50 });

  return (
    <Modal
      title="Graph of Connection Execution Steps"
      open={visible}
      onCancel={handleClose}
      width="70%"
      footer={null}
      destroyOnClose
    >
      <Form layout="horizontal" labelCol={{ span: 4 }}>
        <Form.Item label="Operation name">
          <Select value={operationName} onChange={setOperationName} placeholder="Select">
            {options.map((item) => (
              <Option key={item.value} value={item.value}>
                {item.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>

      {hasError && (
        <div className="wrap-errors">
          <Alert message="Error" description="Configuration contains errors" type="error" showIcon closable={false} />
        </div>
      )}

      <div className="container-cy">
        <div className="wrap-cy">
          <div ref={cyDivRef} id="cy"></div>
        </div>
        <div className="wrap-controls">
          <GraphControls
            onFitGraph={fitGraph}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onPanLeft={panLeft}
            onPanRight={panRight}
            onPanTop={panTop}
            onPanBottom={panBottom}
          />
        </div>
      </div>
    </Modal>
  );
});

DiagramDialog.displayName = 'DiagramDialog';

export default DiagramDialog;

