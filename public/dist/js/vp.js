// All logic and stuff
$(function(){

	var socket = io.connect('localhost:8080');

	socket.on('comm', function (data) {
		console.log(data);
	});


    Chart.types.Line.extend({
	    name: "Line2Y",
	    getScale: function(data) {
	        var startPoint = this.options.scaleFontSize;
	        var endPoint = this.chart.height - (this.options.scaleFontSize * 1.5) - 5;
	        return Chart.helpers.calculateScaleRange(
	            data,
	            endPoint - startPoint,
	            this.options.scaleFontSize,
	            this.options.scaleBeginAtZero,
	            this.options.scaleIntegersOnly);
	    },
	    initialize: function (data) {
	        var y2datasetLabels = [];
	        var y2data = [];
	        var y1data = [];
	        data.datasets.forEach(function (dataset, i) {
	            if (dataset.y2axis == true) {
	                y2datasetLabels.push(dataset.label);
	                y2data = y2data.concat(dataset.data);
	            } else {
	                y1data = y1data.concat(dataset.data);
	            }
	        });
	        
	        // use the helper function to get the scale for both datasets
	        var y1Scale = this.getScale(y1data);
	        this.y2Scale = this.getScale(y2data);
	        var normalizingFactor = y1Scale.max / this.y2Scale.max;

	        // update y2 datasets
	        data.datasets.forEach(function(dataset) {
	            if (y2datasetLabels.indexOf(dataset.label) !== -1) {
	                dataset.data.forEach(function (e, j) {
	                    dataset.data[j] = e * normalizingFactor;
	                })
	            }
	        })

	        // denormalize tooltip for y2 datasets
	        this.options.multiTooltipTemplate = function (d) {
	            if (y2datasetLabels.indexOf(d.datasetLabel) !== -1) 
	                return Math.round(d.value / normalizingFactor, 6);
	            else 
	                return d.value;
	        }

	        Chart.types.Line.prototype.initialize.apply(this, arguments);
	    },
	    draw: function () {
	        this.scale.xScalePaddingRight = this.scale.xScalePaddingLeft;
	        Chart.types.Line.prototype.draw.apply(this, arguments);

	        this.chart.ctx.textAlign = 'left';
	        this.chart.ctx.textBaseline = "middle";
	        this.chart.ctx.fillStyle = "#666";
	        var yStep = (this.scale.endPoint - this.scale.startPoint) / this.y2Scale.steps
	        for (var i = 0, y = this.scale.endPoint, label = this.y2Scale.min; 
	             i <= this.y2Scale.steps; 
	             i++) {
	                this.chart.ctx.fillText(label, this.chart.width - this.scale.xScalePaddingRight + 10, y);
	                y -= yStep;
	                label += this.y2Scale.stepValue
	        }
	    }
	});

	var lineChartData_4 = {
	    labels: ["18:55", "18:56", "18:57", "18:58", "18:59", "19:00", "19:01"],
	    datasets: [{
	        label: "Thermopar 1",
	        fillColor : "rgba(220,220,220,0.5)",
            strokeColor : "rgba(220,220,220,1)",
            pointColor : "rgba(220,220,220,1)",
            pointStrokeColor : "#fff",
	        data: [15, 25, 90, 81, 56, 55, 135]
	    }, {
	        label: "Thermopar 2",
	        fillColor: "rgba(151,187,205,0.5)",
	        strokeColor: "rgba(151,187,205,1)",
	        pointColor: "rgba(151,187,205,1)",
	        pointStrokeColor: "#fff",
	        data: [150, 48, 120, 19, 46, 27, 100],
	        y2axis: true
	    }, {
	        label: "Thermopar 3",
	        fillColor : "rgba(151,187,205,0.5)",
            strokeColor : "rgba(151,187,205,1)",
            pointColor : "rgba(151,187,205,1)",
            pointStrokeColor : "#fff",
	        data: [105, 48, 40, 19, 46, 27, 200],
	        y2axis: true
	    }]
	}

	var vpChartEl = document.getElementById("vpChart").getContext("2d");

	var myLine4 = new Chart(vpChartEl).Line(lineChartData_4, {
	    scaleBeginAtZero: true,
	    scaleShowGridLines: false
	});


	// areaChart.Line(lineChartData, areaChartOptions);

});

