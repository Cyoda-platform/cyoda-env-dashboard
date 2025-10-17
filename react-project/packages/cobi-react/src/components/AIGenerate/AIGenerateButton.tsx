import React, { useRef } from 'react';
import { Button, Tooltip } from 'antd';
import { RobotOutlined } from '@ant-design/icons';
import AIGenerateDialog, { AIGenerateDialogRef } from './AIGenerateDialog';

interface AIGenerateButtonProps {
  type: 'dataMapper' | 'dataSource';
  onSuccess?: () => void;
}

const AIGenerateButton: React.FC<AIGenerateButtonProps> = ({ type, onSuccess }) => {
  const dialogRef = useRef<AIGenerateDialogRef>(null);

  const handleClick = () => {
    dialogRef.current?.open();
  };

  return (
    <>
      <Tooltip title="AI Generate Configuration">
        <Button type="primary" icon={<RobotOutlined />} onClick={handleClick}>
          AI Generate
        </Button>
      </Tooltip>

      <AIGenerateDialog ref={dialogRef} type={type} onSuccess={onSuccess} />
    </>
  );
};

export default AIGenerateButton;

