// All logic and stuff
$(function(){

	var socket = io.connect('localhost:8080');

	socket.on('comm', function (data) {
		console.log(data);
	});
	
    var lineChartData = {
        labels : ["January","February","March","April","May","June","July"],
        datasets_Y1 : [
            {
                fillColor : "rgba(220,220,220,0.5)",
                strokeColor : "rgba(220,220,220,1)",
                pointColor : "rgba(220,220,220,1)",
                pointStrokeColor : "#fff",
                data : [15,25,90,81,56,55,400]
            }
        ],
        datasets_Y2 : [
            {
                fillColor : "rgba(151,187,205,0.5)",
                strokeColor : "rgba(151,187,205,1)",
                pointColor : "rgba(151,187,205,1)",
                pointStrokeColor : "#fff",
                data : [105,48,40,19,96,27,100]
            }
        ],
        datasetss: [
      	{
          label: "Temperature",
          fillColor: "rgba(243, 156, 18, 0.2)",
          strokeColor: "rgba(210, 214, 222, 1)",
          pointColor: "rgba(243, 156, 18, 1)",
          pointStrokeColor: "#c1c7d1",
          pointHighlightFill: "#fff",
          pointHighlightStroke: "rgba(220,220,220,1)",
          data : [105,48,40,19,96,27,100]
        }
      	]
    };

	var tempChartData = {
      	labels : ["January","February","March","April","May","June","July"],
      	datasets: [
      	{
          label: "Temperature",
          fillColor: "rgba(243, 156, 18, 0.2)",
          strokeColor: "rgba(210, 214, 222, 1)",
          pointColor: "rgba(243, 156, 18, 1)",
          pointStrokeColor: "#c1c7d1",
          pointHighlightFill: "#fff",
          pointHighlightStroke: "rgba(220,220,220,1)",
          data : [105,48,40,19,96,27,100]
        }
      	]
  	};

    var areaChartOptions = {
			//Boolean - If we should show the scale at all
			showScale: true,
			//Boolean - Whether grid lines are shown across the chart
			scaleShowGridLines: false,
			//String - Colour of the grid lines
			scaleGridLineColor: "rgba(0,0,0,.05)",
			//Number - Width of the grid lines
			scaleGridLineWidth: 1,
			//Boolean - Whether to show horizontal lines (except X axis)
			scaleShowHorizontalLines: true,
			//Boolean - Whether to show vertical lines (except Y axis)
			scaleShowVerticalLines: true,
			//Boolean - Whether the line is curved between points
			bezierCurve: true,
			//Number - Tension of the bezier curve between points
			bezierCurveTension: 0.3,
			//Boolean - Whether to show a dot for each point
			pointDot: false,
			//Number - Radius of each point dot in pixels
			pointDotRadius: 4,
			//Number - Pixel width of point dot stroke
			pointDotStrokeWidth: 1,
			//Number - amount extra to add to the radius to cater for hit detection outside the drawn point
			pointHitDetectionRadius: 20,
			//Boolean - Whether to show a stroke for datasets
			datasetStroke: true,
			//Number - Pixel width of dataset stroke
			datasetStrokeWidth: 2,
			//Boolean - Whether to fill the dataset with a color
			datasetFill: true,
			//String - A legend template
			legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].lineColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>",
			//Boolean - whether to maintain the starting aspect ratio or not when responsive, if set to false, will take up entire container
			maintainAspectRatio: true,
			//Boolean - whether to make the chart responsive to window resizing
			responsive: true,

			pointDot: true,
			scaleLabel: "<%=value%>*",
			animation : false

		};

    var areaChartCanvas = $("#areaChart").get(0).getContext("2d");

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


	var lineChartData1 = {
	    labels: ["January", "February", "March", "April", "May", "June", "July"],
	    datasets: [{
	        label: "My First dataset",
	        fillColor : "rgba(220,220,220,0.5)",
            strokeColor : "rgba(220,220,220,1)",
            pointColor : "rgba(220,220,220,1)",
            pointStrokeColor : "#fff",
	        data: [15, 25, 90, 81, 56, 55, 135]
	    }, {
	        label: "My Second dataset",
	        fillColor: "rgba(151,187,205,0.5)",
	        strokeColor: "rgba(151,187,205,1)",
	        pointColor: "rgba(151,187,205,1)",
	        pointStrokeColor: "#fff",
	        data: [150, 48, 120, 19, 46, 27, 100],
	        y2axis: true
	    }, {
	        label: "My Third dataset",
	        fillColor : "rgba(151,187,205,0.5)",
            strokeColor : "rgba(151,187,205,1)",
            pointColor : "rgba(151,187,205,1)",
            pointStrokeColor : "#fff",
	        data: [105, 48, 40, 19, 46, 27, 200],
	        y2axis: true
	    }]
	}

	var ctx = document.getElementById("areaChart").getContext("2d");
	var myLine1 = new Chart(ctx).Line2Y(lineChartData1, {
	    scaleBeginAtZero: true,
	    scaleShowGridLines: false
	});

	// areaChart.Line(lineChartData, areaChartOptions);

});

