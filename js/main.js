//CONSTANTS
var SECONDS = 1000;
var STANDARD_SCALE = 600; //600px standard scale

var CHUTE_DIST = [100, 165]; //early chute, late chute
var CHUTE_1_COLOR = [255, 165, 0, 50];
var CHUTE_2_COLOR = [15, 15, 200, 50];

var FIRST_AID_TIME = 10.0; 

var CAR_POS = [[119, 234], [174, 190], [164, 168], [261 , 201], [296, 207], [323, 206], [334, 219], [463, 185], [386, 168], [426, 426], [443, 435], [445, 450], [517, 227], [439, 339], [257, 288]];
var CIRCLE_DEFS = [
    //{idx: 0, downtime: 1, uptime: 1, dps: 5},
    {idx: 1, downtime: 412, uptime: 300, dps: .5},
    {idx: 2, downtime: 200, uptime: 149, dps: .75},
    {idx: 3, downtime: 150, uptime: 90, dps: 1},
    {idx: 4, downtime: 120, uptime: 52, dps: 1.5},
    {idx: 5, downtime: 120, uptime: 42, dps: 3},
    {idx: 6, downtime: 90, uptime: 30, dps: 5},
    {idx: 7, downtime: 90, uptime: 26, dps: 7.5},
    {idx: 8, downtime: 60, uptime: 15, dps: 11},
    {idx: 9, downtime: 300, uptime: 15, dps: 11}
]

//variables 
var lastDown = new Date().getTime(); 
var dragging = false;
var downEvent = null;
var moveEvent = null;  
var arrow = false; 
var pathDone = false; 
var postDone = false; 
var resizedDuringAnim = false;
var lastResizeDraw = 0;  

var pathStart = [0, 0];
var pathEnd = [0, 0];

var lineDraw1 = [0, 0];
var lineDraw2 = [0, 0];

var linePts = [];
var dists = [];
var lineAngle = 0; 

var animStart = 0;
var animFrames = 0;  

var pathCanvasHeight = 0; 
var pathCanvasWidth = 0; 

var pathSlope = 0; 
var pathB = 0; 

var clicked = false; 
var clickStart = [0, 0];
var clickEnd = [0, 0];

var lastScaled = null; 

var bg = new Image();
var bgLoaded = false; 
bg.src = "img/4thres.jpg";

var bgLines = new Image();
var bgLinesLoaded = false; 
bgLines.src = "img/4thres_letterslines.jpg";

var bgLetters = new Image();
var bgLettersLoaded = false; 
bgLetters.src = "img/4thres_letters.jpg";

var car = new Image();
var carLoaded = false; 
car.src = "img/car_pin.png";

var car_out = new Image();
var carOutLoaded = false; 
car_out.src = "img/car_pin_outline.png";

var car_out_blk = new Image();
var carOutBlkLoaded = false; 
car_out_blk.src = "img/car_pin_outline_blk.png";

var car_out_org = new Image();
var carOutOrgLoaded = false; 
car_out_org.src = "img/car_pin_outline_org.png";

var car_out_blue = new Image();
var carOutBlueLoaded = false; 
car_out_blue.src = "img/car_pin_outline_blue.png";

var dirty = true

var heat = null; 

bg.onload = function()
{
	bgLoaded = true;
}

bgLetters.onload = function()
{
    bgLettersLoaded = true;
}

bgLines.onload = function()
{
    bgLinesLoaded = true;
}

car.onload = function()
{
    carLoaded = true;
}

car_out.onload = function()
{
    carOutLoaded = true;
}

function DebugTime()
{
    gameTime += 5 * SECONDS; 
}

function Reset(error = false, errorMsg = "")
{
	pathDone = false; 
    postDone = false; 
    clicked = false; 

    var calculating = document.getElementById('calculating');
    calculating.style.display = "inline"; 

    if(error == true)
    {
        var error = document.getElementById('error');
        error.innerHTML = errorMsg; 
    } else
    {
        var error = document.getElementById('error');
        error.innerHTML = ""; 
    }

    var legend = document.getElementById('legend');
    legend.style.display = "none"; 

    var clock = document.getElementById('gameclock');
    clock.innerHTML = "";

    var clock2 = document.getElementById('lowerclock');
    clock2.innerHTML = "";

    var circlecont = document.getElementById('circlecontainer');
    circlecont.innerHTML = "";

    var healthbarcont = document.getElementById('healthbarcontainer');
    healthbarcont.innerHTML = "";

    var canvas = document.getElementById('mainCanvas');
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    DrawBGCanvas();
}

function DrawCars()
{
    var canvas2 = document.getElementById('bgCanvas');
    var ctx2 = canvas2.getContext('2d');
    var scaleFactor = ctx2.canvas.height / STANDARD_SCALE;
    for(x=0;x<CAR_POS.length;x++)
    {
        if(carOutLoaded)
        {
            ctx2.drawImage(car_out_blk, Math.floor((CAR_POS[x][0] - 1) * scaleFactor), Math.floor((CAR_POS[x][1] - 1) * scaleFactor), Math.floor(18 * scaleFactor), Math.floor(18 * scaleFactor));
        }
        ctx2.drawImage(car, Math.floor(CAR_POS[x][0] * scaleFactor), Math.floor(CAR_POS[x][1] * scaleFactor), Math.floor(16 * scaleFactor), Math.floor(16 * scaleFactor));
    }
}

function DrawBGCanvas()
{
    var canvas2 = document.getElementById('bgCanvas');
    var ctx2 = canvas2.getContext('2d');
    if(pathDone)
    {
        ctx2.drawImage(bgLetters, 0, 0, canvas2.width, canvas2.height);
    }
    else
    {
        ctx2.drawImage(bgLines, 0, 0, canvas2.width, canvas2.height);
    }
    DrawCars();
}

function Resize(scale) {
	var canvas = document.getElementById('mainCanvas');
	var container = document.getElementById('container');
	var leftbar = document.getElementById('leftBar');
	var sndcontainer = document.getElementById('sndcontainer');
	var ctx = canvas.getContext('2d');
    var canvas2 = document.getElementById('bgCanvas');
    var ctx2 = canvas2.getContext('2d');

    ctx.canvas.height = container.clientHeight; 
    ctx.canvas.width = ctx.canvas.height; 
    ctx2.canvas.height = container.clientHeight; 
    ctx2.canvas.width = ctx2.canvas.height; 

    if(scale)
    {
        lastScaled = Date.now(); 

        if(bgLinesLoaded && carLoaded)
        {
            DrawBGCanvas();
        }

        if(pathDone && !postDone)
        {
            resizedDuringAnim = true; 
        }

        if(pathDone)
        {

            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            setTimeout(function(){
                if(Date.now() >= lastScaled + 400 && Date.now() >= lastResizeDraw + 400)
                {
                    //Draw the path! 
                    DrawPath(true); 
                }
            }, 500)
        }

    }


    var canvascont = document.getElementById('canvasContainer');
	container.style.marginTop = (window.innerHeight - container.clientHeight) / 2; 
	sndcontainer.style.width = (leftbar.clientWidth + ctx.canvas.width + 100);
    canvascont.style.width = ctx.canvas.width; 
    canvascont.style.height = ctx.canvas.height; 
    canvascont.style.left = leftbar.clientWidth; 
}

function Scale() {
    var canvas = document.getElementById('mainCanvas');
    var container = document.getElementById('container');
    var leftbar = document.getElementById('leftBar');
    var sndcontainer = document.getElementById('sndcontainer');
    var ctx = canvas.getContext('2d');
    var canvas2 = document.getElementById('bgCanvas');
    var ctx2 = canvas2.getContext('2d');
    //ctx.canvas.height = container.clientHeight; 
    //ctx.canvas.width = ctx.canvas.height; 
    //ctx2.canvas.height = container.clientHeight; 
    //ctx2.canvas.width = ctx2.canvas.height; 
    var canvascont = document.getElementById('canvasContainer');
    container.style.marginTop = (window.innerHeight - container.clientHeight) / 2; 
    sndcontainer.style.width = (leftbar.clientWidth + ctx.canvas.width + 100);
    canvascont.style.width = ctx.canvas.width; 
    canvascont.style.height = ctx.canvas.height; 
    canvascont.style.left = leftbar.clientWidth; 
}

//lmao can you imagine being this much of a nerd that u know how this works 
function DrawArrow(fromx, fromy, tox, toy){
    //variables to be used when creating the arrow
    var c = document.getElementById("mainCanvas");
    var ctx = c.getContext("2d");
    var headlen = 10;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    var angle = Math.atan2(toy-fromy,tox-fromx);

    //starting path of the arrow from the start square to the end square and drawing the stroke
    ctx.beginPath();
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(tox, toy);
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 6;
    ctx.stroke();

    //starting a new path from the head of the arrow to one of the sides of the point
    ctx.beginPath();
    ctx.moveTo(tox, toy);
    ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),toy-headlen*Math.sin(angle-Math.PI/7));

    //path from the side point of the arrow, to the other side point
    ctx.lineTo(tox-headlen*Math.cos(angle+Math.PI/7),toy-headlen*Math.sin(angle+Math.PI/7));

    //path from the side point back to the tip of the arrow, and then again to the opposite side point
    ctx.lineTo(tox, toy);
    ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),toy-headlen*Math.sin(angle-Math.PI/7));

    //draws the paths created above
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
}

function DrawClick(x, y)
{
	var c = document.getElementById("mainCanvas");
    var ctx = c.getContext("2d");

    ctx.beginPath();
    ctx.arc(x, y, 6, 0, 2 * Math.PI, false);
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.stroke();
    ctx.fill();
}

function getY(x, slope, b)
{
	return (x * slope) + b;
}

function getX(y, slope, b)
{
	return (y - b) / slope;
}

function DrawPath(resizeDraw = false){

    var error = document.getElementById('error');
    error.innerHTML = ""; 
    
    DrawBGCanvas();
	var c = document.getElementById("mainCanvas");
    var ctx = c.getContext("2d");  

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    var fromx = pathStart[0] * c.width / pathCanvasWidth;
    var fromy = pathStart[1] * c.height / pathCanvasHeight;
    var tox = pathEnd[0] * c.width / pathCanvasWidth;
    var toy = pathEnd[1] * c.height / pathCanvasHeight;  

    var headlen = 10;

    var angle = Math.atan2(toy-fromy,tox-fromx);
    lineAngle = angle; 

    var slopeNum = (toy - fromy);
    var slopeDenom = (tox - fromx);
    var slope = slopeNum/slopeDenom; 

    //y = mx+b 
    //y = slope(x) + b 
    //fromy = slope(fromx) + b 
    //b = fromy - slope(fromx)
    var b = fromy - (slope*fromx); 

    var foundPos = false; 
    var foundNeg = false; 

    var posPos = [0, 0];
    var negPos = [0, 0];

    var x = fromx; 
    var y = fromy; 

    var idx = 0 

    // //Add pts while we go! 
    // linePts = [];

    // while(foundPos == false)
    // {
    // 	x = x * slopeDenom; 
    // 	y = y * slopeNum; 

    // 	if(x <= 0 || x >= c.width)
    // 	{
    // 		foundPos = true; 
    // 		posPos[0] = x; 
    // 		posPos[1] = getY(x, slope, b);
    // 	} 
    // 	else if(y <= 0 || y >= c.height)
    // 	{
    // 		foundPos = true; 
    // 		posPos[1] = y; 
    // 		posPos[0] = getX(y, slope, b);
    // 	}

    //     idx++; 
    //     if(idx >= 1000)
    //     {
    //         //bail out
    //         foundPos = true; 
    //         posPos[0] = 1000;
    //         posPos[1] = 1000; 
    //     }
    // }

    // var x = fromx; 
    // var y = fromy; 

    // idx = 0 

    // while(foundNeg == false)
    // {
    // 	x = x * -1 * slopeDenom; 
    // 	y = y * -1 * slopeNum; 

    // 	if(x <= 0 || x >= c.width)
    // 	{
    // 		foundNeg = true;
    // 		negPos[0] = x; 
    // 		negPos[1] = getY(x, slope, b);
    // 	} 
    // 	else if(y <= 0 || y >= c.height)
    // 	{
    // 		foundNeg = true; 
    // 		negPos[1] = y; 
    // 		negPos[0] = getX(y, slope, b);
    // 	}

    //     idx++; 
    //     if(idx >= 1000)
    //     {
    //         //bail out 
    //         foundNeg = true; 
    //         negPos[0] = -1000; 
    //         negPos[1] = -1000; 
    //     }
    // }

    // var iterX = fromx; 
    // var iterY = fromy; 

    // for(i=0; i<1000; i++)
    // {
    //     if(slope > 1)
    //     {
    //         iterY = iterY + 1; 
    //         linePts.push([getX(iterY, slope, b), iterY]);
    //     } 
    //     else
    //     {
    //         iterX = iterX + 1; 
    //         linePts.push([iterX, getY(iterX, slope, b)]);
    //     }
    // }

    //console.log(angle);
    //console.log(angle*57.2);

    //test intersections

    var width = c.width; 
    var height = c.height;

    var intersect1 = null;
    var intersect2 = null; 
    var intersect3 = null; 
    var intersect4 = null;

    var pt1 = [fromx, fromy]; 
    var pt2 = [tox, toy];

    if(slope < 0)
    {
        //top line
        intersect1 = math.intersect(pt1, pt2, [0, 0], [width, 0]);
        //left line
        intersect2 = math.intersect(pt1, pt2, [0, 0], [0, height]);
        // //right line
        intersect3 = math.intersect(pt1, pt2, [width, 0], [width, height]);
        // //bottom line
        intersect4 = math.intersect(pt1, pt2, [0, height], [width, height]);
    } else
    {
        //top line
        intersect1 = math.intersect(pt2, pt1, [0, 0], [width, 0]);
        //left line
        intersect2 = math.intersect(pt2, pt1, [0, 0], [0, height]);
        // //right line
        intersect3 = math.intersect(pt2, pt1, [width, 0], [width, height]);
        // //bottom line
        intersect4 = math.intersect(pt2, pt1, [0, height], [width, height]);
    }

    // console.log(intersect1);
    // console.log(intersect2);
    // console.log(intersect3);
    // console.log(intersect4);

    var solved = 0; 

    if(intersect1 == null || intersect2 == null || intersect3 == null || intersect4 == null)
    {
        Reset(true, "Invalid Path!"); 
        return; 
    }

    if(intersect1[0] <= width + 1 && intersect1[0] >= -1) 
    {
        if(solved == 0)
        {
            lineDraw1 = intersect1;
            solved++;
        } else {
            lineDraw2 = intersect1;
        }
    }

    if(intersect4[0] <= width + 1 && intersect4[0] >= -1) 
    {
        if(solved == 0)
        {
            lineDraw1 = intersect4;
            solved++;
        } else {
            lineDraw2 = intersect4;
        }
    }

    if(intersect2[1] <= height + 1 && intersect2[1] >= -1) 
    {
        if(solved == 0)
        {
            lineDraw1 = intersect2;
            solved++;
        } else {
            lineDraw2 = intersect2;
        }
    }

    if(intersect3[1] <= height + 1 && intersect3[1] >= -1) 
    {
        if(solved == 0)
        {
            lineDraw1 = intersect3;
            solved++;
        } else {
            lineDraw2 = intersect3;
        }
    }

    // console.log(lineDraw1, lineDraw2);

    pathSlope = slope; 
    pathB = b; 

    UpdateLine();

    animFrames = 0; 
    animStart = Date.now(); 
    currentIdx = 0; 
    currentX = 0; 
    currentY = 0; 

    setTimeout(function(){CalcDists(resizeDraw)}, 1); 
}

function UpdateLine()
{
    var c = document.getElementById("mainCanvas");
    var ctx = c.getContext("2d");  

    ctx.beginPath();
    ctx.moveTo(lineDraw1[0], lineDraw1[1]);
    ctx.lineTo(lineDraw2[0], lineDraw2[1]);

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 6;
    ctx.stroke();
}

function HandleDown(event)
{
	//offsetx, offsety is what we want (ignores the screen)
	// console.log("!!! down")
	// console.log(event)

	if(arrow)
	{
		FinishPath(downEvent.offsetX, downEvent.offsetY, moveEvent.offsetX, moveEvent.offsetY)
	} 
	else if(!pathDone){
		lastDown = new Date().getTime();
		dragging = true 
		downEvent = event; 
	}
}

function HandleMove(event)
{
	//past X and without an up we're probably dragging
	if(new Date().getTime() - lastDown > 20 && dragging && pathDone == false && clicked == false)
	{
		arrow = true; 
		document.body.style.cursor = "pointer";
		moveEvent = event; 
        //firefox hack 
        offsetX = downEvent.offsetX; 
        offsetY = downEvent.offsetY;
        if(downEvent.offsetX == 0 && downEvent.offsetY == 0)
        {
            offsetX = downEvent.layerX;
            offsetY = downEvent.layerY;
        }
        //end firefox hack
        DrawArrow(offsetX, offsetY, moveEvent.offsetX, moveEvent.offsetY);
	}
}

function HandleUp(event)
{
	//If arrow, do X
	if(arrow)
	{
        //firefox hack 
        offsetX = downEvent.offsetX; 
        offsetY = downEvent.offsetY;
        if(downEvent.offsetX == 0 && downEvent.offsetY == 0)
        {
            offsetX = downEvent.layerX;
            offsetY = downEvent.layerY;
        }

        offsetX2 = moveEvent.offsetX; 
        offsetY2 = moveEvent.offsetY;
        if(moveEvent.offsetX == 0 && moveEvent.offsetY == 0)
        {
            offsetX2 = moveEvent.layerX;
            offsetY2 = moveEvent.layerY;
        }
        //end firefox hack
		FinishPath(offsetX, offsetY, offsetX2, offsetY2);
	}
	else if(clicked == false && !pathDone)
	{
		clicked = true; 
		clickStart[0] = event.offsetX;
		clickStart[1] = event.offsetY;
        DrawClick(clickStart[0], clickStart[1]);
	}
	else if(clicked == true && !pathDone)
	{
		clicked = false; 
		FinishPath(clickStart[0], clickStart[1], event.offsetX, event.offsetY);
	}

	arrow = false 
	dragging = false
	document.body.style.cursor = "default";
}

function FinishPath(startx, starty, tox, toy)
{
	var canvas = document.getElementById('mainCanvas');
	var ctx = canvas.getContext('2d');
	pathCanvasHeight = canvas.height; 
	pathCanvasWidth = canvas.width; 
	pathDone = true; 
	pathStart[0] = startx; 
	pathStart[1] = starty; 
	pathEnd[0] = tox;
	pathEnd[1] = toy; 

    DrawPath();
}

//distance between two pts [x, y]
function distsqd(pt1, pt2)
{
    var a = pt1[0] - pt2[0];
    var b = pt1[1] - pt2[1];
    return Math.sqrt( a*a + b*b );
}

function distfromline(pt)
{
    var slope = 1 /pathSlope * -1;  
    var pt1 = pt; 
    var pt2 = [pt1[0] + 1, pt1[1] + slope]; 

    var intersect = math.intersect(pt1, pt2, lineDraw1, lineDraw2);
    return distsqd(pt1, intersect); 
}

//distance from closest point on a line using pythagorean theorem and congruency
//this doesn't work! blurk  
// function distfromline(slope, lineb, pt, debug)
// {
//     var x1 = pt[0];
//     var y1 = pt[1];
//     var x2 = getX(y1, slope, lineb);
//     var y2 = getY(x1, slope, lineb);

//     //make a right triangle
//     var a = Math.abs(x1 - x2);
//     var b = Math.abs(y1 - y2);

//     //find the hypoteneuse 
//     var c = Math.sqrt(a*a + b*b);

//     //split in half 
//     var d = c / 2;

//     if(debug)
//     {
//         console.log(x1, y1, x2, y2, a, b, c, d);
//         console.log("slope: " + slope);
//         console.log("lineb: " + lineb);
//     }

//     return d;  
// }

var currentIdx = 0; 
var currentX = 0; 
var currentY = 0; 
var gameTime = 0; 

function RunGameTime()
{
    if(pathDone)
    {
        var dt = Date.now() - lastUpdateTimer; 
        lastUpdateTimer = Date.now()
        var clock = document.getElementById('gameclock');
        var m = 0; 
        var s = 0;
        gameTime += dt
        var displayTime = Math.floor(gameTime / SECONDS);
        //123 = 01:03
        s = displayTime % 60; 
        m = (displayTime - s) / 60;
        var str = ""; 
        if(m < 10)
        {
            str = str + "0";
        }
        str = str + m.toString() + ":";
        if(s < 10)
        {
            str = str + "0";
        }
        str = str + s.toString();

        clock.innerHTML = str;

        if(gameTime > 60 * SECONDS * 60)
        {
            Reset();
        }

        setTimeout(function(){RunGameTime();},1000);
    }
}

var circles = [];

function StartCircles()
{
    circles = []
    if(pathDone)
    {
        var circlecont = document.getElementById('circlecontainer');
        var addTime = 0; 

        //deep copy
        circles = JSON.parse(JSON.stringify(CIRCLE_DEFS));

        for(n=0;n<circles.length;n++)
        {
            var circle = circles[n];
            circle.downtime = circle.downtime * SECONDS; 
            circle.uptime = circle.uptime * SECONDS;
            addTime += circle.downtime;
            circle.add_downtime = addTime;
            addTime += circle.uptime; 
            circle.add_uptime = addTime;
        }

        lastUpdateCircles = Date.now();

        DisplayCircles();

        setTimeout(function(){RunCircles();},1000);
    }
}

function DisplayCircles()
{
    var circlecont = document.getElementById('circlecontainer');
    circlecont.innerHTML = "";
    var count = 4
    if(circles.length < count)
    {
        count = circles.length;
    }

    for(i=0; i< count; i++)
    {
        var str = ""
        var circleclass = i == 0 ? "activecircle" : "circle";
        var dps = circles[i].dps.toString().replace(/^0+/, ''); 
        //var closing = circles[i].downtime > 0 ? "WAITING " : "CLOSING! "; 
        var phrases = ["SAFE: ", "CLOSE: "];
        // var timestr = "";
        // var time = circles[i].downtime > 0 ? circles[i].downtime : circles[i].uptime;
        //var times = [circles[i].downtime, circles[i].uptime]
        var times = [circles[i].add_downtime - circles[i].downtime, circles[i].add_uptime];
        var displayTimes = [];
        for(n=0;n<times.length;n++)
        {
            var timestr = "";
            var time = times[n]
            var displayTime = Math.floor(time / SECONDS);
            var s = displayTime % 60; 
            var m = (displayTime - s) / 60;
            timestr = timestr + m.toString() + ":";
            if(s < 10)
            {
                timestr = timestr + "0";
            }
            timestr = timestr + s.toString();
            displayTimes.push(timestr);
        }
        str = str + "<div class="+circleclass+"><div class='dps'>"+dps+"</div><div class='dpsfooter'>DPS</div><div class='closetime'>";
        str = str + "CIRCLE " + circles[i].idx + "<br>";
        str = str + displayTimes[0]
        // for(n=0; n<displayTimes.length; n++)
        // {
        //     str = str + phrases[n] + displayTimes[n]
        //     if(n != displayTimes.length - 1)
        //     {
        //         str = str + "<br>";
        //     }
        // }
        str = str +"</div>";
        circlecont.innerHTML = circlecont.innerHTML + str;
    }

    UpdateHealth();
}

function UpdateHealth()
{
    if(circles.length > 0)
    {
        var healthbarcont = document.getElementById('healthbarcontainer');
        var circle = circles[0];
        var lowestHP = Math.ceil(circle.dps*FIRST_AID_TIME);
        var myclass = "veryhighhp"

        if(lowestHP <= 5)
        {
            myclass = "lowhp";
        }
        else if(lowestHP <= 20)
        {
            myclass = "lowishhp";
        }
        else if(lowestHP <= 50)
        {
            myclass = "medhp"
        }
        else if(lowestHP <= 75)
        {
            myclass="highhp";
        }

        healthbarcont.innerHTML = "<progress id='healthbar' class='"+myclass+"' value='"+lowestHP.toString()+"' max='100'></progress><div id='healthtext'>LOWEST HEALTH TO USE FIRST AID</div>";
    }
}

var lastUpdateCircles = 0; 
var lastUpdateTimer = 0; 

function RunCircles()
{
    if(pathDone)
    {
        var circlecont = document.getElementById('circlecontainer');

        var dt = Date.now() - lastUpdateCircles;
        lastUpdateCircles = Date.now();

        if(circles.length > 0)
        {
            var i = 0;

            if(circles[i].downtime > 0)
            {
                circles[i].downtime -= dt; 
            } else
            {
                circles[i].uptime -= dt; 
            }

            // var time = circles[i].downtime > 0 ? circles[i].downtime : circles[i].uptime;
            // var displayTime = Math.floor(time / SECONDS)
            // var closing = circles[i].downtime > 0 ? "WAIT " : "CLOSE ";
            // var timestr = "";
            // var s = displayTime % 60; 
            // var m = (displayTime - s) / 60;
            // if(m < 10)
            // {
            //     timestr = timestr + "0";
            // }
            // timestr = timestr + m.toString() + ":";
            // if(s < 10)
            // {
            //     timestr = timestr + "0";
            // }
            // timestr = timestr + s.toString();

            // var el = circlecont.firstChild;
            // var close = el.getElementsByClassName('closetime')[0];
            // close.innerHTML = closing + timestr;

            if(circles[i].uptime <= 0)
            {
                var a_time = 800;
                circles.splice(0, 1);
                var els = circlecont.getElementsByClassName('circle');
                var animDate = Date.now();

                var canvas = document.getElementById('mainCanvas');
                var ctx = canvas.getContext('2d');

                var height = ctx.canvas.height; 

                //ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

                var scaleFactor = height / STANDARD_SCALE;

                setTimeout(function(){CircleAnim(els, a_time, animDate, 0, scaleFactor)}, 5);
                setTimeout(function(){DisplayCircles();},a_time);
            }
        }

        setTimeout(function(){RunCircles();},1000);
    }
}

function CircleAnim(els, a_time, animDate, pos, scaleFactor)
{
    var step = a_time / 5;
    var distance = 70 * scaleFactor; 
    var delta = distance/step;

    var active_el = document.getElementsByClassName('activecircle')[0];

    if(pos==0)
    {
        active_el.style.opacity = 1.0;
    }

    if(Date.now() - animDate > a_time)
    {
        return 
    }

    pos = pos - delta;
    var displaypos = pos;

    for(idx=0;idx<els.length;idx++)
    {
        var a_el = els[idx];
        a_el.style.top = (displaypos).toString() + "px"; 
    }


    active_el.style.opacity = active_el.style.opacity - 0.01; 

    setTimeout(function(){CircleAnim(els, a_time, animDate, pos, scaleFactor)}, 5);
}

function CalcDists(resizeDraw)
{
    if(pathDone)
    {
        if(!resizeDraw)
        {
            var canvas = document.getElementById('mainCanvas');
            var ctx = canvas.getContext('2d');

            var calculating = document.getElementById('calculating');
            calculating.style.display = "none"; 

            var legend = document.getElementById('legend');
            legend.style.display = "inline"; 

            var clock = document.getElementById('gameclock');
            clock.innerHTML = "00:00";

            var clock2 = document.getElementById('lowerclock');
            clock2.innerHTML = "APPROX. GAME TIME";

            gameTime = 0; 
            lastUpdateTimer = Date.now();

            setTimeout(function(){RunGameTime();},1000);

            StartCircles();
        }

        // var height = ctx.canvas.height; 
        // var width = ctx.canvas.width; 

        // var i = 0;
        // dists = [];
        // for(x=0;x<=width;x++)
        // {
        //     for(y=0;y<=height;y++)
        //     {
        //         var dist = distfromline([x, y]);
        //         dists[i] = dist;
        //         i++;
        //     }
        // }

        animStart = Date.now(); 
        animFrames = 0; 

        if(resizedDuringAnim == false)
        {
            PostPathUpdate();
        }
        
        if(resizeDraw == true)
        {
            resizedDuringAnim = false;
            PostPathUpdate(true)
        }
    }
}

var lastDistLimit = 0; 

function PostPathUpdate(resizeDraw = false)
{
    if(animFrames == 0)
    {
        lastDistLimit = 0; 
    }

    if(!pathDone)
    {
        return; 
    }

    if(resizedDuringAnim == true)
    {
        return;
    }

    var slope = pathSlope; 
    var b = pathB; 
    var t = Date.now() - animStart;

    if(resizeDraw == true)
    {
        lastDistLimit = 0; 
        t = 3500; 
        lastResizeDraw = Date.now(); 
    }

    var canvas = document.getElementById('mainCanvas');
    var ctx = canvas.getContext('2d');

    var height = ctx.canvas.height; 
    var width = ctx.canvas.width; 

    //ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    var scaleFactor = height / STANDARD_SCALE;

    //what distance should we display? 1 distance unit every 10ms 
    distLimit = Math.floor(t / 10) * scaleFactor;

    var c1 = CHUTE_1_COLOR;
    var c2 = CHUTE_2_COLOR;

    var idx = 0; 
    // for(x=0;x<=width;x++)
    // {
    //     for(y=0;y<=height;y++)
    //     {
    //         var dist = dists[idx]
    //         idx++;
    //         if(dist <= distLimit && dist > lastDistLimit)
    //         {
    //             if(dist <= CHUTE_DIST[0] * scaleFactor)
    //             {
    //                 DrawPixel(ctx, x, y, c1[0], c1[1], c1[2], c1[3]);
    //             }
    //             else if(dist <= CHUTE_DIST[1] * scaleFactor)
    //             {
    //                 DrawPixel(ctx, x, y, c2[0], c2[1], c2[2], c2[3]);
    //             }
    //         }
    //     }
    // }

    var newEnd1 = new Array(lineDraw1[0], lineDraw1[1]);
    var newEnd2 = new Array(lineDraw2[0], lineDraw2[1]);

    if(newEnd1[0] > -.1 && newEnd1[0] < .1)
    {
        newEnd1 = math.intersect(newEnd1, newEnd2, [-200, 0], [-200, height + 200]);
    } 
    if(newEnd1[0] > width - 1 && newEnd1[0] < width + 1)
    {
        newEnd1 = math.intersect(newEnd1, newEnd2, [width + 200, 0], [width + 200, height + 200]);
    }
    if(newEnd1[1] > -.1 && newEnd1[1] < .1)
    {
        newEnd1 = math.intersect(newEnd1, newEnd2, [0, -200], [width + 200, -200]);
    }
    if(newEnd1[1] > height - 1 && newEnd1[1] < height + 1)
    {
        newEnd1 = math.intersect(newEnd1, newEnd2, [0, height + 200], [width + 200, height + 200]);
    }

    if(newEnd2[0] > -.1 && newEnd2[0] < .1)
    {
        newEnd2 = math.intersect(newEnd1, newEnd2, [-200, 0], [-200, height + 200]);
    } 
    if(newEnd2[0] > width - 1 && newEnd2[0] < width + 1)
    {
        newEnd2 = math.intersect(newEnd1, newEnd2, [width + 200, 0], [width + 200, height + 200]);
    }
    if(newEnd2[1] > -.1 && newEnd2[1] < .1)
    {
        newEnd2 = math.intersect(newEnd1, newEnd2, [0, -200], [width + 200, -200]);
    }
    if(newEnd2[1] > height - 1 && newEnd2[1] < height + 1)
    {
        newEnd2 = math.intersect(newEnd1, newEnd2, [0, height + 200], [width + 200, height + 200]);
    }

    var lw_og = Math.floor(t/10) * scaleFactor * 2; 
    var lw1 = lw_og;
    var lw2 = lw_og

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.beginPath();
    ctx.moveTo(newEnd1[0], newEnd1[1]);
    ctx.lineTo(newEnd2[0], newEnd2[1]);

    ctx.strokeStyle = 'rgba(0, 0, 100, 0.17)';
    if(lw1 > CHUTE_DIST[1] * scaleFactor * 2)
    {
        lw1 = CHUTE_DIST[1] * scaleFactor * 2
    }
    ctx.lineWidth = lw1;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(newEnd1[0], newEnd1[1]);
    ctx.lineTo(newEnd2[0], newEnd2[1]);

    ctx.strokeStyle = 'rgba(255, 200, 0, 0.2)';
    lw = lw_og;
    if(lw2 > CHUTE_DIST[0] * scaleFactor * 2)
    {
        lw2 = CHUTE_DIST[0] * scaleFactor * 2;
    }
    ctx.lineWidth = lw2;
    ctx.stroke();

    UpdateLine()

    for(x=0;x<CAR_POS.length;x++)
    {
        var pos = CAR_POS[x]; 
        var posX = pos[0] * scaleFactor; 
        var posY = pos[1] * scaleFactor;
        var dist = distfromline([posX, posY]);
        if(dist <= distLimit && dist > lastDistLimit)
        {
            var canvas2 = document.getElementById('bgCanvas');
            var ctx2 = canvas2.getContext('2d'); 

            if(dist <= CHUTE_DIST[0] * scaleFactor + 5)
            {
                ctx2.drawImage(car_out_org, Math.floor((CAR_POS[x][0] - 1) * scaleFactor), Math.floor((CAR_POS[x][1] - 1) * scaleFactor), Math.floor(18 * scaleFactor), Math.floor(18 * scaleFactor));
                ctx2.drawImage(car, Math.floor(CAR_POS[x][0] * scaleFactor), Math.floor(CAR_POS[x][1] * scaleFactor), Math.floor(16 * scaleFactor), Math.floor(16 * scaleFactor));
            }
            else if(dist <= CHUTE_DIST[1] * scaleFactor + 5)
            {
                ctx2.drawImage(car_out_blue, Math.floor((CAR_POS[x][0] - 1) * scaleFactor), Math.floor((CAR_POS[x][1] - 1) * scaleFactor), Math.floor(18 * scaleFactor), Math.floor(18 * scaleFactor));
                ctx2.drawImage(car, Math.floor(CAR_POS[x][0] * scaleFactor), Math.floor(CAR_POS[x][1] * scaleFactor), Math.floor(16 * scaleFactor), Math.floor(16 * scaleFactor));
            }
        }
    }

    lastDistLimit = distLimit; 

    //1.5 seconds of animation = entire screen accounted for (unecessarily)
    if(t >= 3000)
    {
        postDone = true; 
    }

    // if(lastDistLimit <= 10)
    // {
    //     UpdateLine();
    // }

    animFrames++;

    if(!postDone && pathDone)
    {
        requestAnimationFrame(PostPathUpdate);
    }
}

// function Update()
// {
// 	var canvas = document.getElementById('mainCanvas');
// 	var ctx = canvas.getContext('2d');

// 	if(bgLoaded)
// 	{
// 		ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
// 		DrawHeatAtPoint(ctx, 50, 50, 50)
// 	}

// 	if(arrow)
// 	{
// 		DrawArrow(downEvent.offsetX, downEvent.offsetY, moveEvent.offsetX, moveEvent.offsetY);
// 	}

// 	if(clicked)
// 	{
// 		DrawClick(clickStart[0], clickStart[1]);
// 	}

// 	if(pathDone)
// 	{
// 		DrawPath();
// 	}

// 	requestAnimationFrame(Update);
// }

function DrawPixel(ctx, x, y, r, g, b, a)
{
	ctx.fillStyle = "rgba("+r+","+g+","+b+","+(a/255)+")";
	ctx.fillRect( x, y, 1, 1 );
}

window.mobilecheck = function() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

window.onload = function() 
{
	Resize(false);
    var canvas = document.getElementById('mainCanvas');
	window.addEventListener('resize', function(){Resize(true)}, false);
	canvas.addEventListener('mousedown', HandleDown, false);
	canvas.addEventListener('mousemove', HandleMove, false);
	canvas.addEventListener('mouseup', HandleUp, false);

	var canvas2 = document.getElementById('bgCanvas');
    var ctx = canvas2.getContext('2d');

    if(bgLinesLoaded && carLoaded)
    {
        DrawBGCanvas()
    }

	document.getElementById("reset").addEventListener('mouseup', Reset, false);

    var is_mobile = window.mobilecheck();

    if(is_mobile)
    {
        var calculating = document.getElementById('calculating');
        calculating.innerHTML = "Touch two points to begin"
    }

	// Update();
} 