/**
 * Display information with Graph Display
 * Olle Kaiser, Summer 2018 
 */

var graphReady = false;
function initGraphDisplay() {
    window.graphCanvas = document.getElementById("graph-display");
    graphCanvas.width = canvas.width;
    window.graphCtx = graphCanvas.getContext("2d");


    /* Event listener for mouse movement */
    graphCanvas.addEventListener("mousemove", e => {
        var rect = graphCanvas.getBoundingClientRect();
        var x = Math.round(e.clientX - rect.left);
        var y = Math.round(e.clientY - rect.top);

        renderGraph({
            x: x,
            y: y
        }, graphSettings.data, graphSettings.theme);
    })

    graphCanvas.addEventListener("mouseout", e => renderGraph())

    graphReady = true;
    /* Initiate a frame */
    renderGraph();
}

/* Test input data  */
var driftSkin = JSON.parse('[{"rating":4.36,"date":25533730},{"rating":4.35,"date":25534931},{"rating":4.35,"date":25536132},{"rating":4.35,"date":25537361},{"rating":4.34,"date":25538562},{"rating":4.33,"date":25539846},{"rating":4.32,"date":25541046},{"rating":4.32,"date":25542247},{"rating":4.31,"date":25543448},{"rating":4.31,"date":25544649},{"rating":4.3,"date":25545849},{"rating":4.29,"date":25547050},{"rating":4.3,"date":25548251},{"rating":4.28,"date":25549979},{"rating":4.27,"date":25551236},{"rating":4.27,"date":25552441},{"rating":4.27,"date":25553713},{"rating":4.27,"date":25554929},{"rating":4.28,"date":25556226},{"rating":4.28,"date":25557426},{"rating":4.28,"date":25558626},{"rating":4.26,"date":25559826},{"rating":4.26,"date":25561079},{"rating":4.26,"date":25562279},{"rating":4.25,"date":25563479},{"rating":4.25,"date":25564679},{"rating":4.26,"date":25565879}]')
var maverickSkin = JSON.parse('[{"rating":3,"date":25539846},{"rating":3.06,"date":25541046},{"rating":3.29,"date":25542247},{"rating":3,"date":25543448},{"rating":3.05,"date":25544649},{"rating":2.96,"date":25545849},{"rating":2.89,"date":25547050},{"rating":2.97,"date":25548251},{"rating":2.97,"date":25549979},{"rating":3.01,"date":25551236},{"rating":3.01,"date":25552441},{"rating":2.97,"date":25553713},{"rating":3.03,"date":25554929},{"rating":3.08,"date":25556226},{"rating":3.01,"date":25557426},{"rating":3.03,"date":25558626},{"rating":3.07,"date":25559826},{"rating":3.02,"date":25561079},{"rating":3.03,"date":25562279},{"rating":3.02,"date":25563479},{"rating":3,"date":25564679},{"rating":2.99,"date":25565879}]')
var pandaSkin = JSON.parse('[{"rating":3.18,"date":25561079},{"rating":3.73,"date":25562279},{"rating":3.6,"date":25563479},{"rating":3.51,"date":25564679},{"rating":3.39,"date":25565879}]');

/* Default color theme */

var defaultTheme = {
    bg: "#141414",
    /* Background color */
    fg: "grey",
    /* Inner color of graph */
    outline: "black",
    /* Outline of graph */
    grid: "#282828",
    /* Grid color */
    thickness: 5,
    /* Graph thickness */
    gridSize: 40
}

var graphSettings = {
    data: driftSkin,
    theme: defaultTheme,
    renderFrames: 20,
    /* Don't touch zone */
    graphRenderProgress: 0
}


function resetGraph() {
    graphSettings.graphRenderProgress = 0;
    renderGraph();
}


function renderGraph(position) {
    if(!graphReady) return;

    var data = graphSettings.data;
    theme = graphSettings.theme;

    var noData = false;
    if(data.length == 0){
        data = [{rating: 0, date: 0}]
        noData = true;
    }

    /* Change the padding on the sides */
    var padding = 40; // px
    // Fill canvas
    graphCtx.fillStyle = theme.bg;
    graphCtx.fillRect(0, 0, graphCanvas.width, graphCanvas.height);

    // Set variables
    var pointDistance = graphCanvas.width / (data.length - 1);
    var highestEntry = data[0].rating;
    var lowestEntry = data[0].rating;

    // Get highest and lowest rating
    for (item of data) {
        if (item.rating > highestEntry) highestEntry = item.rating;
        if (item.rating < lowestEntry) lowestEntry = item.rating;
    }

    /* Calculate range and scale */
    var range = highestEntry - lowestEntry;
    
    //var range = 5;
    var scale = (graphCanvas.height - padding * 2) / range;

    var progress = data.length;
    var rePaint = false;
    if (graphSettings.graphRenderProgress < graphSettings.renderFrames) {
        progress = data.length * (graphSettings.graphRenderProgress / graphSettings.renderFrames);
        graphSettings.graphRenderProgress++;
        rePaint = true;
    }

    var decrease = range / 3;
    var sideValue = highestEntry;

    /* Draw grid */
    for (let i = 0; i < graphCanvas.width; i++) {
        if (i % theme.gridSize == 0) {
            graphCtx.fillStyle = theme.grid;
            graphCtx.fillRect(i, 0, 1, graphCanvas.height);
            graphCtx.fillRect(0, i, graphCanvas.width, 1);
        }
    }




    graphCtx.beginPath();
    graphCtx.lineWidth = theme.thickness * 1.5 * 0 /* Remove outline.*/;
    graphCtx.strokeStyle = theme.outline;
    /* Draw out outline */
    for (let i = 0; i < progress; i++) {
        var x = i * pointDistance;
        var y = graphCanvas.height - (((data[i].rating * scale) - lowestEntry * scale) + padding);
        graphCtx.lineTo(x, y);
        graphCtx.stroke();
    }

    graphCtx.beginPath();
    graphCtx.lineWidth = theme.thickness;
    graphCtx.strokeStyle = theme.fg;
    /* Draw out graph */
    for (let i = 0; i < progress; i++) {
        var x = i * pointDistance;
        var y = graphCanvas.height - (((data[i].rating * scale) - lowestEntry * scale) + padding);
        graphCtx.lineTo(x, y);
        graphCtx.stroke();
    }

    /* Side-gradient */
    for (let i = 0; i < graphCanvas.height; i++) {

        graphCtx.fillStyle = "rgba(0, 0, 0, " + (1 - i / 100) + ")";
        graphCtx.fillRect(i, 0, 1, graphCanvas.height);
    }

    /* Draw side values */
    for (let i = 0; i < graphCanvas.height; i++) {

        if (i % theme.gridSize == 0 && i > 0) {

            graphCtx.font = "20px Arial";
            graphCtx.textAlign = "left";
            graphCtx.fillStyle = "white";
            if (sideValue >= highestEntry - decrease * 4) {
                var numString = (Math.round(sideValue * 100) / 100).toString();
                if (numString.length == 1) numString += ".0";
                graphCtx.fillText(numString, 25, i + 5)
                sideValue -= decrease;
            }
        }
    }

    /* Draw cursor highlight */
    if (position !== undefined && isNaN(position) && !noData) {

        var nearestPoint = Math.round(position.x / pointDistance) * pointDistance;
        /* Adjust cursor position */
        graphCtx.fillStyle = "white";
        graphCtx.fillRect(nearestPoint, 0, 1, graphCanvas.height);

        graphCtx.font = "20px Arial";
        graphCtx.textAlign = "right";
        var inspectedData = graphSettings.data[Math.round(nearestPoint / pointDistance)];
        var daysAgo = Math.round(((Date.now() / 1000 / 60) - inspectedData.date) / 60 / 24);
        var daysAgoMessage = " days ago.";
        if (daysAgo == 0) daysAgo = 1;
        if (daysAgo == 1) daysAgoMessage = " day ago.";
        graphCtx.fillText("Rating: " + inspectedData.rating + ", " + daysAgo + daysAgoMessage, graphCanvas.width - 15, graphCanvas.height - 15)
    }

    if(range == 0 || data.length == 0){
        graphCtx.textAlign = "center";
        graphCtx.font = "30px Arial";
        graphCtx.fillText("No recorded changes.", graphCanvas.width/2, graphCanvas.height/2);
    }

    if (rePaint) requestAnimationFrame(renderGraph);
}