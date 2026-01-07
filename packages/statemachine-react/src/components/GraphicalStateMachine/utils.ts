/**
 * Cytoscape Utility Functions
 * Migrated from: .old_project/packages/cyoda-ui-lib/src/components-library/patterns/GraphicalStatemachineMap/utils.ts
 */

import type { 
  Transition, 
  Process, 
  Criteria, 
  PositionsMap, 
  Position,
  NodeConfig 
} from '../../types';

export const NONE_STATE_ID = 'noneState';

export const getStartStateNode = (
  transition: Transition, 
  positionsMap: null | PositionsMap, 
  isCurrentState: boolean
): NodeConfig => {
  const stateClasses = ['node-state'];
  if (isCurrentState) stateClasses.push('current-state');
  
  const node: NodeConfig = {
    data: {
      entityId: transition.startStateId || '',
      id: transition.startStateId || '',
      title: transition.startStateName || '',
      persisted: transition.persisted,
      type: 'state',
    },
    classes: stateClasses.join(' '),
  };

  if (node.data.id === NONE_STATE_ID) {
    node.classes = 'node-state node-state-none';
  }

  if (positionsMap && transition.startStateId) {
    node.position = positionsMap[transition.startStateId];
    if (node.position) {
      node.locked = true;
    }
  }

  return node;
};

export const getEndStateNode = (
  transition: Transition, 
  positionsMap: null | PositionsMap, 
  isCurrentState: boolean
): NodeConfig => {
  const stateClasses = ['node-state'];
  if (isCurrentState) stateClasses.push('current-state');
  
  const node: NodeConfig = {
    data: {
      entityId: transition.endStateId || '',
      id: transition.endStateId || '',
      title: transition.endStateName || '',
      persisted: transition.persisted,
      type: 'state',
    },
    classes: stateClasses.join(' '),
  };

  if (positionsMap && transition.endStateId) {
    node.position = positionsMap[transition.endStateId];

    if (node.position) {
      node.locked = true;
    }
  }

  return node;
};

export const getStatesTransitionsEles = (
  transitions: Transition[], 
  positionsMap: null | PositionsMap, 
  currentState: null | string
): NodeConfig[] => {
  return transitions.reduce((result: NodeConfig[], transition: Transition) => {
    const startState = result.find((node) => node.data.id === transition.startStateId);
    const endState = result.find((node) => node.data.id === transition.endStateId);

    if (!startState) {
      result.push(getStartStateNode(transition, positionsMap, currentState === transition.startStateName));
    }

    if (!endState) {
      result.push(getEndStateNode(transition, positionsMap, currentState === transition.endStateName));
    }

    result.push({
      data: {
        entityId: transition.id,
        id: transition.id,
        source: transition.startStateId,
        target: transition.endStateId,
        title: `[${transition.automated ? 'A' : 'M'}] ${transition.name}`,
        persisted: transition.persisted,
        type: 'edge',
      },
      classes: `edge hide-titles-edge ${transition.automated ? '' : 'edge-manual'}`,
    });
    
    return result;
  }, []);
};

export const ellipsis = (str: string, limit: number = 38, postfix: string = '...'): string => {
  if (str.length < limit) {
    return str;
  }

  return str.substr(0, limit).trim() + postfix;
};

export const getChildPosition = ({
  compoundPosition,
  index,
  count,
  maxY,
}: {
  compoundPosition: Position;
  index: number;
  count: number;
  maxY?: number;
}): Position => {
  if (count === 1) {
    return { ...compoundPosition };
  }

  const yBase = compoundPosition.y + count / 4 * 80;

  const y = (typeof maxY === 'number' ? Math.min(yBase, maxY) : yBase) - Math.floor(index / 2) * 80;

  if (count % 2 && index === count - 1) {
    return {
      x: compoundPosition.x,
      y,
    };
  }

  if (index % 2) {
    return {
      x: compoundPosition.x + 100,
      y,
    };
  }

  return {
    x: compoundPosition.x - 100,
    y,
  };
};

export const getProcessesChildEles = ({
  transition,
  processesList,
  parent,
  compoundPosition,
  maxY,
}: {
  transition: Transition;
  processesList: Process[];
  parent: string;
  compoundPosition: Position;
  maxY: number;
}): NodeConfig[] => {
  if (!transition.endProcessesIds) return [];
  return transition.endProcessesIds.reduce((result: NodeConfig[], processId: any, index: number) => {
    // Handle both string IDs and object IDs
    let process;
    if (typeof processId === 'string') {
      // Simple string ID
      process = processesList.find((p: any) => p.id === processId);
    } else {
      // Object ID with persisted/runtime structure
      process = processesList.find((p: any) => {
        const pId = p.id?.persisted ? p.id.persistedId : p.id?.runtimeId || p.id;
        const prId = processId.persisted ? processId.persistedId : processId.runtimeId;
        return pId === prId;
      });
    }

    if (!process) {
      return result;
    }

    result.push({
      group: 'nodes',
      data: {
        parent,
        entityId: process.id,
        id: process.id + '-' + transition.id,
        title: ellipsis(process.name || process.id),
        persisted: process.persisted,
        type: 'process',
      },
      classes: 'node-process',
      position: getChildPosition({
        compoundPosition,
        index,
        count: transition.endProcessesIds?.length || 0,
        maxY,
      }),
    });

    return result;
  }, []);
};

export const getProcessCompoundPosition = (
  processId: string,
  endStatePosition: Position,
  positionsMap: null | PositionsMap
): Position => {
  if (positionsMap && positionsMap[processId]) {
    return positionsMap[processId];
  }
  // Position processes to the right of the state
  return { x: endStatePosition.x + 150, y: endStatePosition.y };
};

export const getProcessesEles = ({
  transition,
  endStateEle,
  positionsMap,
  processesList,
  transitionEdge,
}: {
  transition: Transition;
  endStateEle: any;
  transitionEdge: any;
  positionsMap: PositionsMap;
  processesList: Process[];
}): any => {
  if (!transition.endProcessesIds || !transition.endProcessesIds.length) {
    return {};
  }

  const processesCompoundEleId = transition.id + '-processes';
  const sourceEleId = transition.id + '-processes-source';
  const sourcePosition = transitionEdge.targetEndpoint();
  
  const sourceEle = {
    data: { id: sourceEleId, title: '', type: 'processes-source' },
    classes: 'compound-processes-source',
    position: sourcePosition,
    grabbable: false,
  };

  const position = getProcessCompoundPosition(processesCompoundEleId, sourcePosition, positionsMap);

  const processesCompoundEle: any = {
    data: { id: processesCompoundEleId, title: 'Processes', type: 'processes-compound' },
    classes: 'compound-processes',
    position,
  };

  if (positionsMap && positionsMap[processesCompoundEleId]) {
    processesCompoundEle.locked = true;
  }

  const edge = {
    data: {
      id: processesCompoundEleId + '-edge',
      source: sourceEleId,
      target: processesCompoundEleId,
      type: 'processes-edge',
    },
    classes: 'edge edge-process',
  };

  const children = getProcessesChildEles({
    transition,
    processesList,
    parent: processesCompoundEleId,
    compoundPosition: position,
    maxY: endStateEle.position().y - 100,
  });

  if (!children.length) {
    return {};
  }

  return {
    parent: processesCompoundEle,
    edge,
    children,
    position,
    source: sourceEle,
  };
};

export const getCriteriaChildrenEles = ({
  transition,
  criteriaCompoundEleId,
  criteriaList,
  position,
}: {
  transition: Transition;
  criteriaCompoundEleId: string;
  position: Position;
  criteriaList: Criteria[];
}): NodeConfig[] => {
  if (!transition.criteriaIds) return [];
  return transition.criteriaIds.reduce((result: NodeConfig[], criteriaId: any, index: number) => {
    // Handle both string IDs and object IDs
    let criteria;
    if (typeof criteriaId === 'string') {
      // Simple string ID
      criteria = criteriaList.find((c) => c.id === criteriaId);
    } else {
      // Object ID with persisted/runtime structure
      criteria = criteriaList.find((c: any) => {
        const cId = c.id?.persisted ? c.id.persistedId : c.id?.runtimeId || c.id;
        const crId = criteriaId.persisted ? criteriaId.persistedId : criteriaId.runtimeId;
        return cId === crId;
      });
    }

    if (!criteria) {
      return result;
    }

    result.push({
      group: 'nodes',
      data: {
        parent: criteriaCompoundEleId,
        entityId: criteria.id,
        id: transition.id + '-' + criteria.id,
        title: ellipsis(criteria.name || criteria.id),
        fullTitle: criteria.name,
        persisted: criteria.persisted,
        type: 'criteria',
      },
      classes: 'node-criteria',
      grabbable: false,
      position: getChildPosition({
        compoundPosition: position,
        index,
        count: transition.criteriaIds?.length || 0,
      }),
    });

    return result;
  }, []);
};

export const getCriteriaEles = ({
  transition,
  criteriaList,
  position,
}: {
  transition: Transition;
  criteriaList: Criteria[];
  position: Position;
}): any => {
  const criteriaCompoundEleId = transition.id + '-criteria';
  const criteriaCompoundEle = {
    data: { id: criteriaCompoundEleId, title: 'Criteria', transitionId: transition.id },
    classes: 'compound-criteria',
    grabbable: false,
    selectable: false,
  };

  const children = getCriteriaChildrenEles({ transition, criteriaCompoundEleId, criteriaList, position });

  return {
    parent: criteriaCompoundEle,
    criteriaCompoundEleId,
    children,
    position,
  };
};

export const positionBetween = (start: Position, end: Position): Position => {
  return {
    x: (start.x + end.x) / 2,
    y: (start.y + end.y) / 2,
  };
};

export const fillPositionsMap = (positions: any[], map: PositionsMap = {}): PositionsMap => {
  return positions.reduce((m: PositionsMap, node: any) => {
    m[node.data().id] = { ...node.position() };
    return m;
  }, map);
};

