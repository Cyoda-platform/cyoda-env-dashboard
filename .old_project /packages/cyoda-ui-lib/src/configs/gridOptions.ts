import { GroupCellRenderer } from '../cellRenderers/GroupCellRenderer';

export const GRID_CHUNK_SIZE = 40;

export const gridReadonlyOptions = {
    columnTypes: {
      abColDefNumber: {},
      abColDefString: {},
      abColDefBoolean: {},
      abColDefDate: {},
      abColDefObject: {},
    },
    defaultColDef: {
      suppressMenu: true,
      resizable: true,
    },
    autoGroupColumnDef: {
        headerName: 'Group by',
        pinned: 'left',
        cellRendererParams: {
          suppressCount: false,
        },
    },
    // groupUseEntireRow: true,
    groupRowInnerRenderer: GroupCellRenderer,
    enableSorting: false,
    rowModelType: 'serverSide',
    cacheBlockSize: GRID_CHUNK_SIZE,
    cacheOverflowSize: GRID_CHUNK_SIZE / 2,
    maxBlocksInCache: 5,
    maxConcurrentDatasourceRequests: 3,
    functionsReadOnly: true,
    purgeClosedRowNodes: true,
    blockLoadDebounceMillis: GRID_CHUNK_SIZE,
};
