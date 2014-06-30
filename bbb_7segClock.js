// 7 segment digital clock : 2014.06.30
//      for 4 digits 7 seg LED Matrix, Cathod common is bufferd by NPN Tr) 
//          Bonescript / Cloud9
//
//      written by kkurahashi @ kurahashi-ya.com  
///     this source is released under the term of MIT License.
//
// to run this script:
//      node bbb_7segClock.js
//

var b = require('bonescript');

// define pins
	// segments
var LED_A  = 'P8_7';    //  11 (LED pin number)
var LED_B  = 'P8_8';    //   7
var LED_C  = 'P8_9';    //   4
var LED_D  = 'P8_10';   //   2
var LED_E  = 'P8_11';   //   1
var LED_F  = 'P8_12';   //  10
var LED_G  = 'P8_13';   //   5
var LED_DP = 'P8_14';   //   3

var gSegments = [LED_A, LED_B, LED_C, LED_D, LED_E, LED_F, LED_G];


	// segment patterns
var patA  = [b.HIGH, b.LOW,  b.HIGH, b.HIGH, b.LOW,  b.HIGH, b.HIGH, b.HIGH, b.HIGH, b.HIGH, b.LOW]; 
var patB  = [b.HIGH, b.HIGH, b.HIGH, b.HIGH, b.HIGH, b.LOW,  b.LOW,  b.HIGH, b.HIGH, b.HIGH, b.LOW];
var patC  = [b.HIGH, b.HIGH, b.LOW,  b.HIGH, b.HIGH, b.HIGH, b.HIGH, b.HIGH, b.HIGH, b.HIGH, b.LOW];
var patD  = [b.HIGH, b.LOW,  b.HIGH, b.HIGH, b.LOW,  b.HIGH, b.HIGH, b.LOW,  b.HIGH, b.HIGH, b.LOW];
var patE  = [b.HIGH, b.LOW,  b.HIGH, b.LOW,  b.LOW,  b.LOW,  b.HIGH, b.LOW,  b.HIGH, b.LOW,  b.LOW];
var patF  = [b.HIGH, b.LOW,  b.LOW,  b.LOW,  b.HIGH, b.HIGH, b.HIGH, b.LOW,  b.HIGH, b.HIGH, b.LOW];
var patG  = [b.LOW,  b.LOW,  b.HIGH, b.HIGH, b.HIGH, b.HIGH, b.HIGH, b.LOW,  b.HIGH, b.HIGH, b.LOW];

var gPatterns = [patA, patB, patC, patD, patE, patF, patG];


	// col = cathode
var LED_COL1 = 'P8_15'; // 12
var LED_COL2 = 'P8_16'; //  9
var LED_COL3 = 'P8_17'; //  8
var LED_COL4 = 'P8_18'; //  6

var gCols = [LED_COL1, LED_COL2, LED_COL3, LED_COL4];


    // buffer for HHMM
var gColBuffer = null;

    // current column number (0-3)
var gCol = 0;

    // tick counter per second
var gCount = 0;



// config pins
b.pinMode(LED_A,  b.OUTPUT);
b.pinMode(LED_B,  b.OUTPUT);
b.pinMode(LED_C,  b.OUTPUT);
b.pinMode(LED_D,  b.OUTPUT);
b.pinMode(LED_E,  b.OUTPUT);
b.pinMode(LED_F,  b.OUTPUT);
b.pinMode(LED_G,  b.OUTPUT);
b.pinMode(LED_DP, b.OUTPUT);

b.pinMode(LED_COL1, b.OUTPUT);
b.pinMode(LED_COL2, b.OUTPUT);
b.pinMode(LED_COL3, b.OUTPUT);
b.pinMode(LED_COL4, b.OUTPUT);

// ascii code of '0'
var gCodeOfZero = '0'.charCodeAt(0);


// turn off all segments
for (var i = 0; i < 7; i++) {
	b.digitalWrite(gSegments[i], b.LOW);
}

//  turn on all columns
for (var i = 0; i < 4; i++) {
	b.digitalWrite(gCols[i], b.LOW);
}


//  start time interval for update clock
var timerClock = setInterval(updateClock, 1000);

//	start time interval for update display
    //  2mSec is too short for BBB, but this gives fastest result(?)
var timerDynamicDrive = setInterval(dynamicDrive, 2);

//  timer for turn off the segment
var timerTurnOff = null;

// functions

// update clock buffer each second
function updateClock() {
    //  format the time
	var format = 'hhmm';
	var now = new Date();
	format = format.replace(/hh/g, ('0' + now.getHours()).slice(-2));
	format = format.replace(/mm/g, ('0' + now.getMinutes()).slice(-2));
	console.log('time=' + format + ', count=' + gCount);
	
	// set HHMM to buffer
	gColBuffer = format;
	
	// reset performance measurement counter
	gCount = 0;
};

// dynamic drive for 4 digits per interval
function dynamicDrive() {
    // increment performance measurement counter
    gCount++;
    
    // buffer has HHMM
	if (gColBuffer != null) {
		// get number of current digit
		var d = gColBuffer.charCodeAt(gCol) - gCodeOfZero;
		// turn on or off each segment
		for (var j = 0; j < 7; j++) {
			b.digitalWrite(gSegments[j], gPatterns[j][d]);		
		}
		// turn on dp if col 2
		b.digitalWrite(LED_DP, gCol == 2 ? b.HIGH : b.LOW);
		
		// turn on column and start timer for turning it off
		b.digitalWrite(gCols[gCol], b.HIGH);
		timerTurnOff = setTimeout(turnOff, 1);
	}
};


// turn off the column
function turnOff() {
    // stop timeout
    clearTimeout(timerTurnOff);

    // turn off the column
	b.digitalWrite(gCols[gCol], b.LOW);
	
	// increment and adjust boundary for next column
	gCol ++;
	if (gCol >= 4) gCol = 0;
}
