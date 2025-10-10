<script>
import { Bar } from "vue-chartjs";
import resourcesJson from "../../mockups/resources.json";

export default {
  extends: Bar,
  mounted() {
    this.renderChart(this.chartdata, this.options);
  },
  data: () => ({
    chartdata: {
      labels: resourcesJson.map((el) => el.name),
      datasets: [
        {
          label: "Size",
          backgroundColor: "#3da3e8",
          data: resourcesJson.map((el) => el.size),
        },
        {
          label: "Available",
          backgroundColor: "#fd6585",
          data: resourcesJson.map((el) => el.available),
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  }),
};
</script>
