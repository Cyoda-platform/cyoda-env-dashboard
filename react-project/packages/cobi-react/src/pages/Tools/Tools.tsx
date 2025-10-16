import React, { useRef } from 'react';
import { Card, Table, Button } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';
import BlocklyDialog, { BlocklyDialogRef } from './components/BlocklyDialog';
import './Tools.css';

interface Tool {
  name: string;
  action: () => void;
}

const Tools: React.FC = () => {
  const blocklyDialogRef = useRef<BlocklyDialogRef>(null);

  const handleBlocklyTool = () => {
    blocklyDialogRef.current?.open();
  };

  const tools: Tool[] = [
    {
      name: 'Blockly: Check tool for convert in JSON',
      action: handleBlocklyTool,
    },
  ];

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Action',
      key: 'action',
      width: 180,
      render: (_: any, record: Tool) => (
        <Button
          type="primary"
          icon={<PlayCircleOutlined />}
          onClick={record.action}
        >
          Run
        </Button>
      ),
    },
  ];

  return (
    <div className="tools-page">
      <Card>
        <h4>Tools</h4>

        <Table
          columns={columns}
          dataSource={tools}
          rowKey="name"
          pagination={false}
          bordered
        />
      </Card>

      <BlocklyDialog ref={blocklyDialogRef} />
    </div>
  );
};

export default Tools;

