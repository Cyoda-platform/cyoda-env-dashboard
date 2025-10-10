export interface ChartOptions {
  maintainAspectRatio: boolean;
  responsive: boolean;
  legend: {
    position: "top" | "left" | "bottom" | "right";
  };
  title: {
    display: boolean;
    text: string;
  };
  animation: {
    duration: number;
  };
  scales: {
    yAxes: AxesSettings[];
    xAxes: AxesSettings[];
  };
  plugins: {
    datalabels: {
      formatter: (value: string, context: ChartContext) => string;
    };
  };
  onClick: (e: Event, legendItem: ChartLegendItem[]) => void;
}

export interface AxesSettings {
  ticks: {
    fontColor: string | undefined;
  };
}

export interface ChartContext {
  dataset: {
    chartLabel: string[];
  };
  datasetIndex: number;
  dataIndex: number;
}

export interface ChartLegendItem {
  _index: number;
}

export interface IChartSettings {
  reportDefinitionId: string;
  name: string;
  chartType: ChartType;
  dataSource: "group" | "row";
  columns: IChartSettingsColumn[];
  xAxis: {
    chartData: ColumnItem;
    chartLabel: ColumnItem;
  };
  style: {
    backgroundColor: string;
    borderColor: string;
    verticalAxisColor: string;
    horizontalAxisColor: string;
  };
  options: {
    legend: {
      position: "top" | "left" | "bottom" | "right";
    };
    title: {
      display: boolean;
      text: string;
    };
  };
}

export interface IChartSettingsColumn {
  chartData: ColumnItem;
  chartLabel: ColumnItem;
  chartStyle: {
    borderColor: string | null;
    fill: "start";
    backgroundColor: string | null;
  };
}

export interface ChartType {
  label: "Line" | "Pie" | "Bar" | "Scatter";
  value: "LineChart" | "PieChart" | "ColumnChart" | "ScatterChart";
  icon: "chart-line" | "chart-pie" | "chart-bar" | "braille";
  trendline: boolean;
  addNewLabel: boolean;
  multipleColumns: boolean;
  hierarchy: boolean;
}

export interface ColumnItem {
  label: string;
  key: string;
  prop: string;
  type: string;
  icon: string;
  trendline: boolean;
  trendlineType: string;
  isTrendlinePossible: boolean;
}

export interface ChartWindowSettings {
  chartSettings: IChartSettings;
  windowSettings: {
    size: "maximize" | "minimize";
    params: {
      [key: string]: number;
    };
  };
}

interface ChartDataHeader {
  label: string | ChartDataHeaderLabel;
  prop: string;
  chartLabel?: string;
}

interface ChartDataHeaderLabel {
  role: string;
  type?: string;
}
