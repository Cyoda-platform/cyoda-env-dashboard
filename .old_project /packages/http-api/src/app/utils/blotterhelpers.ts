export function dateParseragGrid(params: {
  value: string;
  newValue: string;
  node: string;
}) {
  try {
    return new Date(params.value);
  } catch (ex) {
    // tslint:disable-next-line:no-console
    console.error(
      "Error parsing the date value: " + params.newValue + " and node : ",
      params.node
    );
  }
}

const GRID_CHUNK_SIZE = 40;

function getPageIndex(gridParams = { request: { startRow: 0 } }) {
  return gridParams.request.startRow / GRID_CHUNK_SIZE;
}

export function getPaginationParams(
  gridParams: any = { request: { startRow: 0 } }
) {
  return {
    page: getPageIndex(gridParams),
    size: GRID_CHUNK_SIZE,
  };
}
