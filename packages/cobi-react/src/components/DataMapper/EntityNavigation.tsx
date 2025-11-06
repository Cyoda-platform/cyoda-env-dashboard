import React, { useState, useEffect } from 'react';
import { Button, Space } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import type { MappingConfigDto } from '../../types';
import './EntityNavigation.css';

interface EntityNavigationProps {
  dataMappingConfigDto: MappingConfigDto;
  onChange?: (index: number) => void;
}

export const EntityNavigation: React.FC<EntityNavigationProps> = ({
  dataMappingConfigDto,
  onChange,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const entityMappingsCount = dataMappingConfigDto.entityMappings?.length || 0;

  // Don't show navigation if there's only one entity mapping
  if (entityMappingsCount <= 1) {
    return null;
  }

  const isDisablePrev = currentIndex === 0;
  const isDisableNext = currentIndex === entityMappingsCount - 1;

  const handlePrevEntity = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      if (onChange) {
        onChange(newIndex);
      }
    }
  };

  const handleNextEntity = () => {
    if (currentIndex < entityMappingsCount - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      if (onChange) {
        onChange(newIndex);
      }
    }
  };

  // Emit initial index
  useEffect(() => {
    if (onChange) {
      onChange(currentIndex);
    }
  }, []);

  // Reset index when entity mappings change
  useEffect(() => {
    if (currentIndex >= entityMappingsCount) {
      setCurrentIndex(0);
      if (onChange) {
        onChange(0);
      }
    }
  }, [entityMappingsCount]);

  return (
    <div className="entity-navigation">
      <Space>
        <Button
          disabled={isDisablePrev}
          onClick={handlePrevEntity}
          icon={<LeftOutlined />}
        >
          Previous Entity
        </Button>
        <span className="entity-navigation-info">
          Entity {currentIndex + 1} of {entityMappingsCount}
        </span>
        <Button
          disabled={isDisableNext}
          onClick={handleNextEntity}
        >
          Next Entity
          <RightOutlined />
        </Button>
      </Space>
    </div>
  );
};

export default EntityNavigation;

