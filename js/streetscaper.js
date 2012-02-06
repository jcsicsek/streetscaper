//Copyright 2010 Jeff Csicsek
//No re-use without author's permission

//streetscaper.js

//imaging engine

//dependencies:  streetsmarts.js

var fromLat = 0;
var fromLong = 0;
var toLat = 0;
var toLong = 0;

var groundOverlay = null;

var bikeLane = null;
var busLane = null;
var leftParking = null;
var rightParking = null;
var leftTurn = null;
var rightTurn = null;

var laneTypes = 6;

//laneType
//0 = asphalt
//1 = bus
//2 = left parking
//3 = right parking
//4 = left turn
//5 = right turn
//6 = bike
//7 = left sidewalk
//8 = right sidewalk
var lanes = new Array(laneTypes);

var rotation = 1;

var width = 0;

var leftSWWidth = 10;
var rightSWWidth = 10;

var leftParking = false;
var rightParking = false;

var leftTurn = false;
var rightTurn = false;

var bikeLane = false;
var bikeLaneLeftSide = false;
var bikeLaneBuffer = 0;

var busLane = false;

var movingLaneCount = 1;
var movingLaneWidth = 10;

var north = 0;
var south = 0;
var east = 0;
var west = 0;

var parkingLaneWidth = 12;
var turnLaneWidth = 12;
var busLaneWidth = 12;
var bikeLaneWidth = 5;

var streetInitialized = false;

function refreshAttributes()
{
	bikeLane = document.bikeLaneRadios.bikeLaneExists.checked;
	bikeLaneLeftSide = document.bikeLaneRadios.bikeLaneSide[0].checked;
	bikeLaneBuffer = document.getElementById("bikeBufferWidth").value;
	
	leftSWWidth = document.getElementById("rightSidewalkWidth").value;
	rightSWWidth = document.getElementById("leftSidewalkWidth").value;
	
	leftParking = document.bikeLaneRadios.leftParkingExists.checked;
	rightParking = document.bikeLaneRadios.rightParkingExists.checked;
	
	leftTurn = document.bikeLaneRadios.leftTurnExists.checked;
	rightTurn = document.bikeLaneRadios.rightTurnExists.checked;
	
	busLane = document.bikeLaneRadios.busLaneExists.checked;
	
	width = document.getElementById("widthElement").value;
}

function refreshLanes()
{
	
	//draw base overlay
	drawLane(west, dLongToFeet(east - west), 0);

	//draw sidewalks
	sidewalkChanged();
	
	//refresh lane configuration
	parkingChanged();
	bikeLaneChanged();
	busLaneChanged();
	turnLaneChanged();
}
	

function sidewalkChanged()
{
	leftSWWidth = document.getElementById("rightSidewalkWidth").value;
	rightSWWidth = document.getElementById("leftSidewalkWidth").value;
	
	//left sw = 7
	if (leftSWWidth > 0)
		drawLane(west, leftSWWidth, 7);
	
	//right sw = 8
	if (rightSWWidth > 0)
		drawLane(east - feetToDLongitude(rightSWWidth), rightSWWidth, 8);
	
}

function bikeLaneChanged()
{
	bikeLane = document.bikeLaneRadios.bikeLaneExists.checked;
	bikeLaneLeftSide = document.bikeLaneRadios.bikeLaneSide[0].checked;
	bikeLaneBuffer = document.getElementById("bikeBufferWidth").value;
	
	if (bikeLane)
	{
		refreshAttributes();
		if (busLane && bikeLane && !bikeLaneLeftSide)
		{
			alert("You cannot have both a bus lane and a right-hand-side bike lane.");
			removeLane(6);
			document.bikeLaneRadios.bikeLaneExists.checked = false;
		}
		else
		{
			var leftHandSide;
			bikeLaneWidth = 5;
			if (bikeLaneLeftSide)
			{
				leftHandSide = west + feetToDLongitude(leftSWWidth);
				if (leftParking)
					leftHandSide += feetToDLongitude(parkingLaneWidth);
			}
			else
			{
				leftHandSide = east - feetToDLongitude(rightSWWidth) - feetToDLongitude(bikeLaneWidth);
				if (rightParking)
					leftHandSide -= feetToDLongitude(parkingLaneWidth);
			}
				
			drawLane(leftHandSide, bikeLaneWidth, 6);
		}
	}
	else
	{
		removeLane(6);
	}
}

//2 = left parking
//3 = right parking
function parkingChanged()
{
	parkingLaneWidth = 12;
	leftParking = document.bikeLaneRadios.leftParkingExists.checked;
	rightParking = document.bikeLaneRadios.rightParkingExists.checked;
	var lpLeftSide, rpLeftSide;
	
	if (leftParking)
	{
		lpLeftSide = west + feetToDLongitude(leftSWWidth);
		drawLane(lpLeftSide, parkingLaneWidth, 2);
	}
	else
	{
		removeLane(2);
	}
	if (rightParking)
	{
		rpLeftSide = east - feetToDLongitude(rightSWWidth) - feetToDLongitude(parkingLaneWidth);
		drawLane(rpLeftSide, parkingLaneWidth, 3);
	}
	else
	{
		removeLane(3);
	}
}

//4 = left turn
//5 = right turn
function turnLaneChanged()
{
	turnLaneWidth = 12;
	leftTurn = document.bikeLaneRadios.leftTurnExists.checked;
	rightTurn = document.bikeLaneRadios.rightTurnExists.checked;
	
	var ltLeftSide, rtLeftSide;
	
	if (leftTurn)
	{
		ltLeftSide = west + feetToDLongitude(leftSWWidth);
		if (leftParking)
			ltLeftSide += feetToDLongitude(parkingLaneWidth);
		drawLane(ltLeftSide, turnLaneWidth, 4);
	}
	else
	{
		removeLane(4);
	}
	if (rightTurn)
	{
		rtLeftSide = east - feetToDLongitude(rightSWWidth) - feetToDLongitude(turnLaneWidth);
		if (rightParking)
			rtLeftSide -= feetToDLongitude(parkingLaneWidth);
		drawLane(rtLeftSide, turnLaneWidth, 5);
	}
	else
	{
		removeLane(5);
	}
}

function busLaneChanged()
{
	busLane = document.bikeLaneRadios.busLaneExists.checked;
	
	if (busLane)
	{
		refreshAttributes();
		if (busLane && bikeLane && !bikeLaneLeftSide)
		{
			alert("You cannot have both a bus lane and a right-hand-side bike lane.");
			document.bikeLaneRadios.busLaneExists.checked = false;
		}
		else
		{
			var leftHandSide;
			busLaneWidth = 12;
			leftHandSide = east - feetToDLongitude(rightSWWidth) - feetToDLongitude(busLaneWidth);
			if (rightParking)
				leftHandSide -= feetToDLongitude(parkingLaneWidth);
				
			drawLane(leftHandSide, busLaneWidth, 1);
		}
	}
	else
	{
		removeLane(1);
	}
}



function createGroundOverlay() {

	width = document.getElementById("widthElement").value;
	
  
	var dLat, dLong, centerLat, centerLong;
	dLat = toLat - fromLat;
	dLong = toLong - fromLong;
	rotation = radToDeg(Math.atan(dLongToFeet(dLong)/dLatToFeet(dLat)));
	if (dLong > 0 && dLat < 0)
		rotation = 180 - rotation;
	else if (dLong < 0 && dLat < 0)
		rotation = 180 + rotation;
	else if (dLong < 0 && dLat > 0)
		rotation = 360 - rotation;
	rotation = 358.5 - rotation;
	//alert(rotation);
	if (toLat > fromLat)
	{
		centerLat = fromLat + dLat/2;
	}
	else
	{
		centerLat = toLat + dLat/2;
	}
	if (toLong > fromLong)
	{
		centerLong = fromLong + dLong/2;
	}
	else
	{
		centerLong = toLong + dLong/2;
	}
	
	var distance = getDistance(fromLat, fromLong, toLat, toLong);
	
	south = centerLat - feetToDLatitude(distance)/2;
	north = centerLat + feetToDLatitude(distance)/2;
	west = centerLong - feetToDLongitude(width)/2;
	east = centerLong + feetToDLongitude(width)/2;

	streetInitialized = true;
	
	//draw roadbed and sidewalks
	refreshLanes();
}

//laneType
//0 = asphalt
//1 = bus
//2 = left parking
//3 = right parking
//4 = left turn
//5 = right turn
//6 = bike
//7 = left sidewalk
//8 = right sidewalk

function removeLane(laneType)
{
	if (lanes[laneType])
	{
		ge.getFeatures().removeChild(lanes[laneType]);
		lanes[laneType] = null;
	}
}

function drawLane(leftSide, laneWidth, laneType)
{
	var textureFilename = 'asphalt.jpg';
	if (laneType == 1)
		textureFilename = 'bus_lane.jpg';
	else if (laneType == 2 || laneType == 3)
		textureFilename = 'parking.jpg';
	else if (laneType == 4)
		textureFilename = 'left_turn.jpg';
	else if (laneType == 5)
		textureFilename = 'right_turn.jpg';
	else if (laneType == 6)
	{
		if ((bikeLaneLeftSide && leftParking) || (!bikeLaneLeftSide && rightParking))
			textureFilename = 'bike_lane.jpg';
		else
			textureFilename = 'bike_lane_green.jpg';
	}
	else if (laneType == 7 || laneType == 8)
		textureFilename = 'sidewalk.jpg';
	if (streetInitialized)
	{
		if (lanes[laneType])
		{
			ge.getFeatures().removeChild(lanes[laneType]);
			lanes[laneType] = null;
		}
		var textureURL = 'http://dl.dropbox.com/u/1538165/streetscaper/textures/' + textureFilename;
		//var textureURL = 'file:///C:/Users/jcsicsek.TRITEK/Documents/My%20Dropbox/Public/streetscaper/textures/' + textureFilename;
		lanes[laneType] = ge.createGroundOverlay('');
		lanes[laneType].setIcon(ge.createIcon(''))
		lanes[laneType].getIcon().setHref(textureURL);
		lanes[laneType].setLatLonBox(ge.createLatLonBox(''));
		
		var rightSide = leftSide + feetToDLongitude(laneWidth);
		var bottom = south;
		var top = north;
		
		var latLonBox = lanes[laneType].getLatLonBox();
		latLonBox.setBox(top, bottom, leftSide, rightSide, rotation);
	  
		ge.getFeatures().appendChild(lanes[laneType]);
	}
}

function removeGroundOverlay()
{
	if (lanes[0])
	{
		ge.getFeatures().removeChild(lanes[0]);
		lanes[0] = null;
	}
}	

function toggleOverlay()
{
	if (lanes[0])
	{
		removeGroundOverlay();
	}
	else
	{
		createGroundOverlay();
	}
}

function doMore()
{
	createGroundOverlay();
	//set(latitude, longitude, altitude, altitudemode, heading, tilt, range
	var lookAt = ge.createLookAt('');
    lookAt.set(fromLat, fromLong, 0, ge.ALTITUDE_RELATIVE_TO_GROUND, 360 - rotation, 60, 40);
    ge.getView().setAbstractView(lookAt);

}

function setEndLocation(location)
{
	var geocoder = new google.maps.ClientGeocoder();
    geocoder.getLatLng(location, function(point) {
      if (point) {

		//alert(fromLat + ', ' + fromLong);
        //var lookAt = ge.createLookAt('');
		toLat = point.y;
		toLong = point.x;
		//set(latitude, longitude, altitude, altitudemode, heading, tilt, range
        //lookAt.set(point.y, point.x, 0, ge.ALTITUDE_RELATIVE_TO_GROUND, 40, 60, 40);
        //ge.getView().setAbstractView(lookAt);
		doMore();
      }
    });
}
function setStartLocation(startLocation, endLocation)
{
 
    var geocoder = new google.maps.ClientGeocoder();

    geocoder.getLatLng(startLocation, function(point) {
      if (point) {

		//alert(fromLat + ', ' + fromLong);
        //var lookAt = ge.createLookAt('');
		fromLat = point.y;
		fromLong = point.x;
		//set(latitude, longitude, altitude, altitudemode, heading, tilt, range
        //lookAt.set(point.y, point.x, 0, ge.ALTITUDE_RELATIVE_TO_GROUND, 30, 60, 40);
        //ge.getView().setAbstractView(lookAt);
		setEndLocation(endLocation);
      }
    });
}
function buttonClick() {
	var onStreet = document.getElementById('onStreet').value;
	var fromStreet = document.getElementById('fromStreet').value;
	var toStreet = document.getElementById('toStreet').value;
	var borough = document.getElementById('borough').value;
	
    var startLoc = onStreet + ' and ' + fromStreet + ' ' + borough;
	var endLoc = onStreet + ' and ' + toStreet + ' ' + borough;
	
    var displayText = 'NOW DESIGNING:  ' + onStreet + ' between ' + fromStreet + ' and ' + toStreet + ' in ' + borough;
    var display = document.getElementById('locationDisplay');
    display.firstChild.nodeValue = displayText;

    setStartLocation(startLoc, endLoc);
	
	
  }

  function decreaseWidth()
  {
	if (!width)
		width = 30;
	else if (width > 0)
		width--;
	refreshWidth();
  }
  
  function increaseWidth()
  {
	if (!width)
		width = 30;
	else
		width++;
	refreshWidth();
  }
  
  function refreshWidth()
  {
	document.getElementById("widthElement").value = width;
  }
  
  