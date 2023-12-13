document.addEventListener("DOMContentLoaded", function () {
  var socket = io.connect("http://" + document.domain + ":" + location.port + "/test");

  var initialDataPoints = 20;

  var cpuChart = new Chart(document.getElementById("cpu-chart").getContext("2d"), {
    type: "line",
    data: {
      labels: Array.from({ length: initialDataPoints }, (_, i) => i + 1),
      datasets: [
        {
          label: "CPU Usage",
          data: Array(initialDataPoints).fill(0),
          borderColor: "#3498db", // Blue
          borderWidth: 2,
          fill: false,
        },
      ],
    },
    options: {
      scales: {
        x: {
          type: "linear",
          position: "bottom",
          title: {
            display: true,
            text: "Time (seconds)",
          },
        },
        y: {
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: "CPU Usage (%)",
          },
        },
      },
    },
  });

  var ramChart = new Chart(document.getElementById("ram-chart").getContext("2d"), {
    type: "line",
    data: {
      labels: Array.from({ length: initialDataPoints }, (_, i) => i + 1),
      datasets: [
        {
          label: "RAM Usage",
          data: Array(initialDataPoints).fill(0),
          borderColor: "#e74c3c", // Red
          borderWidth: 2,
          fill: false,
        },
      ],
    },
    options: {
      scales: {
        x: {
          type: "linear",
          position: "bottom",
          title: {
            display: true,
            text: "Time (seconds)",
          },
        },
        y: {
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: "RAM Usage (%)",
          },
        },
      },
    },
  });

  var diskChart = new Chart(document.getElementById("disk-chart").getContext("2d"), {
    type: "line",
    data: {
      labels: Array.from({ length: initialDataPoints }, (_, i) => i + 1),
      datasets: [
        {
          label: "Disk Usage",
          data: Array(initialDataPoints).fill(0),
          borderColor: "#8e44ad", // Purple
          borderWidth: 2,
          fill: false,
        },
      ],
    },
    options: {
      scales: {
        x: {
          type: "linear",
          position: "bottom",
          title: {
            display: true,
            text: "Time (seconds)",
          },
        },
        y: {
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: "Disk Usage (%)",
          },
        },
      },
    },
  });

  var updateCharts = function (data) {
    cpuChart.data.labels.push(cpuChart.data.labels.length + 1);
    ramChart.data.labels.push(ramChart.data.labels.length + 1);
    diskChart.data.labels.push(diskChart.data.labels.length + 1);

    cpuChart.data.datasets[0].data.push(data.cpu);
    ramChart.data.datasets[0].data.push(data.ram);
    diskChart.data.datasets[0].data.push(data.disk);

    cpuChart.update();
    ramChart.update();
    diskChart.update();

    // Read min and max values from the charts
    var cpuMin = Math.min(...cpuChart.data.datasets[0].data);
    var cpuMax = Math.max(...cpuChart.data.datasets[0].data);
    var ramMin = Math.min(...ramChart.data.datasets[0].data);
    var ramMax = Math.max(...ramChart.data.datasets[0].data);
    var diskMin = Math.min(...diskChart.data.datasets[0].data);
    var diskMax = Math.max(...diskChart.data.datasets[0].data);

    // Calculate differences
    var cpuDiff = cpuMax - cpuMin;
    var ramDiff = ramMax - ramMin;
    var diskDiff = diskMax - diskMin;

    // Display differences next to the charts
    document.getElementById("cpu-diff").innerText = "CPU usage increased by: " + cpuDiff.toFixed(2) + "%";
    document.getElementById("ram-diff").innerText = "RAM usage increased by: " + ramDiff.toFixed(2) + "%";
    document.getElementById("disk-diff").innerText = "Disk usage increased by " + diskDiff.toFixed(2) + "%";
  };
  socket.on("update_progress", updateCharts);
});
