const chartColors = {
    red: 'rgb(255, 99, 132)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(201, 203, 207)'
};

// Chart.defaults.global.defaultFontFamily = "Lato";
Chart.defaults.global.defaultFontSize = 18;
Chart.defaults.global.defaultFontColor = "#777";

const secondsPerRevolution = 30;

const cutoutPercentage = 25;
const initialTheta = 0;
const initialdTheta = ((2*Math.PI)/secondsPerRevolution)/1000; // radians per second
let dtheta = 0;
let theta = initialTheta;
let canDraw = false;
let notificationsEnabled = false;
let start;

let currItem;
function drawHandLoop(timestamp) {        
    
    let dupecanvas = document.getElementById("dupeChart");
    let dupectx = dupecanvas.getContext("2d");
    let canvas = timeChart.canvas;
    dupecanvas.height = canvas.height;
    dupecanvas.width = canvas.width;
    dupecanvas.style.display = canvas.style.display;
    dupecanvas.style.height = canvas.style.height;
    dupecanvas.style.width = canvas.style.width;
    let centerX = 2*((timeChart.chartArea.left + timeChart.chartArea.right) / 2);
    let centerY = 2*((timeChart.chartArea.top + timeChart.chartArea.bottom) / 2);
    let length = 0.9*(timeChart.chartArea.bottom - timeChart.chartArea.top);

    if (start === undefined) {
        start = timestamp;
    }
    const elapsed = timestamp - start;
    dupectx.clearRect(0, 0, dupecanvas.width, dupecanvas.height);
    dupectx.strokeStyle = '#000';
    dupectx.fillStyle = '#000';
    dupectx.lineWidth = 10;
    dupectx.beginPath();
    dupectx.moveTo(centerX, centerY);
    dupectx.lineTo(centerX + length*Math.cos(theta + 0.5*Math.PI), centerY - length*Math.sin(theta + 0.5*Math.PI));
    dupectx.stroke();
    dupectx.fill();
    if (dtheta !== 0) {
        theta -= elapsed*dtheta;
        if (theta < 0) {
            theta = (2*Math.PI) + theta;
        }

        const totalProportions = proportions.reduce(function(totalSum, currentValue) { return totalSum + currentValue; }, 0);
        const currentPosFraction = (2*Math.PI - theta) / (2*Math.PI);
        const proportionCumSum = proportions.map((sum => value => sum += value)(0));
        const sublabelProportionCumSum = sublabelProportions.map((sum => value => sum += value)(0));
        let firstIndexUnder;
        for (let ii = 0; ii < proportionCumSum.length; ii++) {
            if (proportionCumSum[ii]/totalProportions >= currentPosFraction) {
                firstIndexUnder = ii;
                break;
            }
        }
        let subFirstIndexUnder;
        for (let ii = 0; ii < sublabelProportionCumSum.length; ii++) {
            if (sublabelProportionCumSum[ii]/totalProportions >= currentPosFraction) {
                subFirstIndexUnder = ii;
                break;
            }
        }

        if (currItem !== labels[firstIndexUnder]) {
            currItem = labels[firstIndexUnder];
            if (notificationsEnabled) {
                new Notification("New Item", {
                    body: `Switch to ${currItem}!`
                });
            }

        }

        document.getElementById("currItem").innerText = labels[firstIndexUnder];
        document.getElementById("currSubitem").innerText = sublabels[subFirstIndexUnder];
    
    
        start = timestamp;        
    }  

    clockAnimationID = requestAnimationFrame(drawHandLoop);
}

function pushNew(event) {
    event.preventDefault();
    timeChart.data.datasets[0].data.push(Math.random());
    timeChart.data.labels.push(Math.random().toFixed(5));
    timeChart.update();
}

let ctx = document.getElementById("myChart").getContext("2d");
let labels = ["CTCI", "Coding", "Con Ed", "Piano", "Art", "Language", "FE"];
let proportions = [3, 3, 4, 2, 2, 2, 1];

let sublabels = [];
Object.assign(sublabels, labels.map(label => {return label + " i";}));
let sublabelMapping = new Map();
labels.forEach((label, idx) => sublabelMapping.set(label, [proportions[idx]]));
let sublabelProportions = Array.from(sublabelMapping.values()).flat();




let titleText = "Time";
let dataLabel = "Sections";

let timeChart = new Chart(ctx, {
    type:"doughnut", // bar, horizontalBar, pie, line, doughnut, radar, polarArea
    data: {
        datasets:[{
            label: dataLabel,
            labels:labels,
            data:proportions,
            borderWidth:1,
            backgroundColor: Object.values(chartColors),
            hoverBorderWidth: 3,
            hoverBorderColor: "black"
        },
        {
          label: "Breakdowns",
          labels: sublabels,
          data: sublabelProportions,
          backgroundColor: Object.values(chartColors),
          borderWidth:1,
        }]
    },
    plugins: [ChartDataLabels],
    options: {
        aspectRatio: 1,

        cutoutPercentage: cutoutPercentage,
        tooltips: {
            callbacks: {
              label: function(tooltipItem, data) {
                var dataset = data.datasets[tooltipItem.datasetIndex];
                var index = tooltipItem.index;
                return dataset.labels[index] + ": " + dataset.data[index];
              }
            }
        },
        animation: {
            onComplete: () => {canDraw = true;},
        },
        legend: {
            display:false,
        },
        plugins: {
            datalabels: {
                // rotation: 90,
                formatter: function(value, context) {
                    if (context.datasetIndex === 0) {
                        return context.chart.data.datasets[context.datasetIndex].labels[context.dataIndex];
                    } else {
                        return "";
                    }
                    
                }
            }
        }
    },
    
})

function updateTimeSum() {
    document.getElementById("timeSum").innerText = proportions.reduce(function(totalSum, currentValue) { return totalSum + parseFloat(currentValue); }, 0);
}

function pushNewItem(item, weight) {
    proportions.push(weight);
    labels.push(item);
    timeChart.update();
    updateTimeSum();
}

function clear() {
    proportions.length = 0;
    labels.length = 0;
    sublabelProportions.length = 0;
    timeChart.update();
}

document.getElementById("addItemForm").addEventListener("submit", (event) => {
    event.preventDefault();
    
    let elements = event.target.elements;
    let item = elements["Item"].value;
    let weight = elements["Weight"].value;
    pushNewItem(item, weight);

})

requestAnimationFrame(drawHandLoop);

document.getElementById("startClock").addEventListener("click", (event) => {
    event.preventDefault();
    start = performance.now();
    if (canDraw) {
        requestAnimationFrame(drawHandLoop);
        dtheta = initialdTheta;    
    }
    
});

document.getElementById("stopClock").addEventListener("click", (event) => {
    event.preventDefault();
    dtheta = 0;
});

document.getElementById("resetClock").addEventListener("click", (event) => {
    event.preventDefault();
    theta = initialTheta;
});

document.getElementById("clearButton").addEventListener("click", (event) => {
    event.preventDefault();
    clear();
});

document.getElementById("saveButton").addEventListener("click", (event) => {
    event.preventDefault();
    localStorage.setItem("items", JSON.stringify({
        labels,
        proportions,
        theta
    }))
});

document.getElementById("loadButton").addEventListener("click", (event) => {
    event.preventDefault();
    let obj = JSON.parse(localStorage.getItem("items"));
    labels.length = 0;
    proportions.length = 0;
    Object.assign(labels, obj.labels);
    Object.assign(proportions, obj.proportions);
    theta = obj.theta;
    timeChart.update();
});

document.getElementById("notificationsEnabled").addEventListener("change", (event) => {
    event.preventDefault();
    if (event.target.checked) {
        notificationsEnabled = true;
    } else {
        notificationsEnabled = false;
    }
})

updateTimeSum();