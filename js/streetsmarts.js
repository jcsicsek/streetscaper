//Copyright 2010 Jeff Csicsek
//No re-use without author's permission

//streetsmarts.js

//mathematical and anciliary functions

//dependencies:  none

function getDistance(lat1, lon1, lat2, lon2)
  {
		var R = 20925525; // Radius of the earth in ft
		var dLat = degToRad(lat2-lat1);  // Javascript functions in radians
		var dLon = degToRad(lon2-lon1); 
		var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
				Math.cos(degToRad(lat1)) * Math.cos(degToRad(lat2)) * 
				Math.sin(dLon/2) * Math.sin(dLon/2); 
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		var d = R * c; // Distance in ft
		return d;
	}
	function feetToDLatitude(y)
	{
		return y / (69 * 5280);
	}
	function feetToDLongitude(x)
	{
		return x / (49.00 * 5280);
	}
	function degToRad(deg)
	{
		return (2 * 3.14159265 * deg) / 360;
	}
	function radToDeg(rad)
	{
		return (360 * rad) / (2 * 3.14159265);
	}
	function dLatToFeet(dLat)
	{
		return (69 * 5280) * dLat;
	}
	function dLongToFeet(dLong)
	{
		return (49 * 5280) * dLong;
	}
	