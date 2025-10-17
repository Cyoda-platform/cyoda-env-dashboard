import React from 'react';
import MetaParamsRow from './MetaParamsRow';
import type { EntityMappingConfigDto } from '../../types';
import './MetaParams.css';

interface MetaParam {
  name: string;
  displayName: string;
  type?: string;
}

interface MetaParamsProps {
  metaParams: MetaParam[];
  allDataRelations: any[];
  selectedEntityMapping: EntityMappingConfigDto;
  onRelationsUpdate?: () => void;
}

const MetaParams: React.FC<MetaParamsProps> = ({
  metaParams,
  allDataRelations,
  selectedEntityMapping,
  onRelationsUpdate,
}) => {
  if (!metaParams || metaParams.length === 0) {
    return null;
  }

  return (
    <div className="meta-params">
      <h2>Meta Params</h2>
      {metaParams.map((metaParam) => (
        <MetaParamsRow
          key={metaParam.name}
          metaParam={metaParam}
          allDataRelations={allDataRelations}
          selectedEntityMapping={selectedEntityMapping}
          onRelationsUpdate={onRelationsUpdate}
        />
      ))}
    </div>
  );
};

export default MetaParams;

