import * as charts from '../../libs/charts.min.js';
export function moduleData() {
  return {
    props: {
      chartData: Object,
    },
    data: function () {
      return {
        chart: false,
      };
    },
    watch: {
      chartData: {
        handler(newValue, oldValue) {
          let self = this;
          self.chart.destroy();
          self.createChart();
        },
        deep: true,
      },
    },
    computed: {},
    mounted: function () {
      this.createChart();
    },
    methods: {
      createChart() {
        let self = this;

        let style = getComputedStyle(document.documentElement);
        let primaryColorstyle = style.getPropertyValue('--uip-color-accent');
        let lightColorstyle = style.getPropertyValue('--uip-color-red-lighter');

        if (self.chartData.colors.main != '') {
          primaryColorstyle = self.chartData.colors.main;
        }
        if (self.chartData.colors.comp != '') {
          lightColorstyle = self.chartData.colors.comp;
        }

        let labels = self.formatLabels(this.chartData.labels);

        let data = {
          labels: labels,
          datasets: [
            {
              label: self.chartData.title,
              backgroundColor: primaryColorstyle,
              borderColor: primaryColorstyle,
              data: self.chartData.data.main,
            },
          ],
        };

        if (self.chartData.data.comparison.length > 0) {
          data.datasets.push({
            label: self.chartData.title,
            backgroundColor: lightColorstyle,
            borderColor: lightColorstyle,
            data: self.chartData.data.comparison,
          });
        }

        const config = {
          type: self.chartData.type,
          data: data,
          options: self.buildTheChartOptions(),
        };

        self.chart = new Chart(self.$refs.uipChart, config);
      },
      formatLabels(labels) {
        let formatted = [];
        for (let [index, value] of labels.main.entries()) {
          let processed = value;
          if (labels.comparison) {
            if (labels.comparison[index]) {
              processed = value + ';' + labels.comparison[index];
            }
          }
          formatted.push(processed);
        }

        return formatted;
      },
      buildTheChartOptions() {
        let self = this;
        return {
          cutout: '0%',
          spacing: 0,
          borderRadius: 0,
          tension: 0.15,
          pointRadius: 0,
          pointHoverRadius: 5,
          borderRadius: 4,
          animation: true,
          interaction: {
            mode: 'nearest',
          },
          hover: {
            intersect: false,
          },
          borderSkipped: false,
          plugins: {
            legend: {
              display: false,
              position: 'bottom',
            },
            tooltip: {
              position: 'average',
              backgroundColor: '#fff',
              padding: 20,
              bodySpacing: 10,
              bodyFont: {
                size: 12,
              },
              titleFont: {
                size: 14,
                weight: 'bold',
              },
              mode: 'index',
              intersect: false,
              xAlign: 'left',
              yAlign: 'center',
              caretPadding: 10,
              cornerRadius: 4,
              borderColor: 'rgba(162, 162, 162, 0.2)',
              borderWidth: 1,
              titleColor: '#333',
              bodyColor: '#777',
              titleMarginBottom: 10,
              bodyFontSize: 100,
              usePointStyle: true,

              enabled: false,

              external: function (context) {
                self.getTooltip(context);
              },
            },
          },
          scales: {
            x: {
              ticks: {
                display: false,
              },
              grid: {
                borderWidth: 0,
                display: true,
                borderDash: [10, 8],
                color: 'rgba(162, 162, 162, 0.4)',
              },
            },
            y: {
              beginAtZero: true,
              ticks: {
                display: false,
              },
              grid: {
                borderWidth: 0,
                display: false,
              },
            },
          },
        };
      },
      getTooltip(context) {
        // Tooltip Element
        let tooltipEl = document.getElementById('chartjs-tooltip');

        // Create element on first render
        if (!tooltipEl) {
          tooltipEl = document.createElement('div');
          tooltipEl.id = 'chartjs-tooltip';
          tooltipEl.innerHTML = "<div class='uip-background-default uip-boder uip-shadow uip-border-round'></div>";
          document.body.appendChild(tooltipEl);
        }

        // Hide if no tooltip
        let tooltipModel = context.tooltip;
        if (tooltipModel.opacity === 0) {
          tooltipEl.style.opacity = 0;
          return;
        }

        // Set caret Position
        tooltipEl.classList.remove('above', 'below', 'no-transform');
        if (tooltipModel.yAlign) {
          tooltipEl.classList.add(tooltipModel.yAlign);
        } else {
          tooltipEl.classList.add('no-transform');
        }

        function getBody(bodyItem) {
          return bodyItem.lines;
        }

        // Set Text
        if (tooltipModel.body) {
          let titleLines = tooltipModel.title || [];
          let bodyLines = tooltipModel.body.map(getBody);

          ///
          ///
          ///
          ///
          let dataset = tooltipModel.dataPoints[0].dataset;
          let tipTitle = dataset.label;
          let tooltipHTML = '<div class="uip-background-default">';
          tooltipHTML += "<div class='uip-text-bold uip-padding-xs uip-border-bottom uip-body-font'>" + tipTitle + '</div>';

          tooltipHTML += '<div class="uip-padding-xs uip-flex uip-flex-column uip-row-gap-xxs">';
          ///Loop through data points and add data
          tooltipModel.dataPoints.forEach(function (item, i) {
            //Get label
            let label = item.label.split(';')[i];
            let color = tooltipModel.labelColors[i].borderColor;

            tooltipHTML += '<div class="uip-flex uip-flex-row uip-gap-xxs uip-flex-between uip-w-125">';
            tooltipHTML += '<div class="uip-text-bold" style="color:' + color + '">' + item.formattedValue + '</div>';
            tooltipHTML += '<div class="uip-text-s uip-text-muted uip-no-wrap">' + label + '</div>';
            tooltipHTML += '</div>';
          });

          tooltipHTML += '</div>';
          tooltipHTML += '</div>';
          ///
          ///
          //Set content
          let tableRoot = tooltipEl.querySelector('div');
          tableRoot.innerHTML = tooltipHTML;
          ///
          ///
          //Set position of tooltip
          // Display, position, and set styles for font
          let position = context.chart.canvas.getBoundingClientRect();
          let bodyFont = Chart.helpers.toFont(tooltipModel.options.bodyFont);
          //
          tooltipEl.style.opacity = 1;
          tooltipEl.style.position = 'absolute';
          tooltipEl.style.left = position.left + window.pageXOffset + tooltipModel.caretX + 'px';
          tooltipEl.style.top = position.top + window.pageYOffset + tooltipModel.caretY + 'px';
          tooltipEl.style.padding = tooltipModel.padding + 'px ' + tooltipModel.padding + 'px';
          tooltipEl.style.pointerEvents = 'none';
        }

        // Display, position, and set styles for font
      },
    },
    template: '\
       <canvas class="uip-min-w-200 uip-chart-canvas" ref="uipChart"></canvas>',
  };
}
