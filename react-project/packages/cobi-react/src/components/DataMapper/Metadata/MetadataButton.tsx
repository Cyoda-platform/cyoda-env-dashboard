import React, { useRef } from 'react';
import { Button, Tooltip } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { EntityMappingConfigDto } from '../../../types';
import MetadataDialog, { MetadataDialogRef } from './MetadataDialog';
import './MetadataButton.css';

interface MetadataButtonProps {
  dstCyodaColumnPath: string;
  dstCyodaColumnPathType: string;
  entityMapping: EntityMappingConfigDto;
  onUpdate?: () => void;
}

const MetadataButton: React.FC<MetadataButtonProps> = ({
  dstCyodaColumnPath,
  dstCyodaColumnPathType,
  entityMapping,
  onUpdate,
}) => {
  const dialogRef = useRef<MetadataDialogRef>(null);

  const hasMetadata = (): boolean => {
    return !!entityMapping.metadata?.find((m) => m.dstCyodaColumnPath === dstCyodaColumnPath);
  };

  const handleClick = () => {
    dialogRef.current?.open(dstCyodaColumnPath, dstCyodaColumnPathType, entityMapping);
  };

  const handleSave = () => {
    onUpdate?.();
  };

  const handleDelete = () => {
    onUpdate?.();
  };

  const isSuccess = hasMetadata();

  return (
    <>
      <Tooltip title={isSuccess ? 'Edit Metadata' : 'Add Metadata'}>
        <Button
          type="text"
          size="small"
          className={`metadata-button ${isSuccess ? 'metadata-button-success' : 'metadata-button-error'}`}
          icon={isSuccess ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
          onClick={handleClick}
        />
      </Tooltip>

      <MetadataDialog ref={dialogRef} onSave={handleSave} onDelete={handleDelete} />
    </>
  );
};

export default MetadataButton;

