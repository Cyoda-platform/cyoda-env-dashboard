<script>
import { Line } from "vue-chartjs";
import nodeStatisticsJson from "../../mockups/node-statistics.json";

export default {
  extends: Line,
  mounted() {
    Chart.defaults.global.defaultFontStyle = "Bold";
    Chart.defaults.global.defaultFontSize = 13;
    this.renderChart(this.chartdata, this.options);
  },
  data: () => ({
    chartdata: {
      datasets: [
        {
          backgroundColor: "rgba(54, 131, 220, .5)",
          borderColor: "rgba(54, 131, 220, 1)",
          borderJoinStyle: "miter",
          borderWidth: 1,
          data: nodeStatisticsJson.cpu.map((el) => ({
            t: el[0],
            y: el[1],
          })),
          fill: undefined,
          label: "CPU %",
          lineTension: 0,
          pointHitRadius: 10,
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      tooltips: {
        backgroundColor: "#fbfbfb",
        bodyFontColor: "#32363C",
        borderColor: "#999",
        borderWidth: 0.5,
        caretPadding: 10,
        cornerRadius: 0,
        displayColors: false,
        position: "nearest",
        titleFontColor: "#606469",
        xPadding: 16,
        yPadding: 10,
      },
      animation: {
        duration: 0,
      },
      legend: {
        display: false,
      },
      scales: {
        xAxes: [
          {
            gridLines: {
              display: false,
            },
            time: {
              displayFormats: {
                hour: "HH:00",
                minute: "HH:00",
              },
              offset: 0,
            },
            type: "time",
            ticks: {
              source: "data",
              autoSkip: true,
              autoSkipPadding: 75,
              maxRotation: 0,
              sampleSize: 5,
            },
          },
        ],
        yAxes: [
          {
            gridLines: {
              borderDash: [3, 6],
              zeroLineBorderDashOffset: 2,
              zeroLineWidth: 1,
            },
            ticks: {
              beginAtZero: true,
            },
          },
        ],
      },
    },
  }),
};
</script>
