/**
 * Graphical State Machine Store
 * Zustand store for graphical state machine UI state
 * Migrated from: .old_project/packages/statemachine/src/stores/graphicalStatemachine.ts
 */

import { create } from 'zustand';
import type { PositionsMap } from '../types';

interface GraphicalStatemachineState {
  positionsMap: PositionsMap | null;
  transitionsShowHideList: string[];
  
  setPositionsMap: (positionsMap: PositionsMap | null) => void;
  updatePositionsMap: (positionsMap: PositionsMap) => void;
  setTransitionsShowHideList: (list: string[]) => void;
  toggleTransitionVisibility: (transitionId: string) => void;
  reset: () => void;
}

export const useGraphicalStatemachineStore = create<GraphicalStatemachineState>((set) => ({
  positionsMap: null,
  transitionsShowHideList: [],
  
  setPositionsMap: (positionsMap) => set({ positionsMap }),
  
  updatePositionsMap: (positionsMap) => set((state) => ({
    positionsMap: {
      ...state.positionsMap,
      ...positionsMap,
    },
  })),
  
  setTransitionsShowHideList: (list) => set({ transitionsShowHideList: list }),
  
  toggleTransitionVisibility: (transitionId) => set((state) => {
    const list = state.transitionsShowHideList;
    const index = list.indexOf(transitionId);
    
    if (index > -1) {
      return {
        transitionsShowHideList: list.filter((id) => id !== transitionId),
      };
    } else {
      return {
        transitionsShowHideList: [...list, transitionId],
      };
    }
  }),
  
  reset: () => set({
    positionsMap: null,
    transitionsShowHideList: [],
  }),
}));

