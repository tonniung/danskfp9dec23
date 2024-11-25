var subtitles = {
        T_13137: {
        lang: "en",
        name: "English",
        tracks: [
        T(TTime("00:00:00.000:00"), TTime("00:00:03.000:00"), "Kun tekst, der er relevant for opgavebesvarelsen, er tekstet til talesyntese."),
        T(TTime("00:00:03.120:00"), TTime("00:00:04.040:00"), "Kedsomhed"),
        T(TTime("00:00:22.320:00"), TTime("00:00:23.240:00"), "Kreativitet"),
        T(TTime("00:00:23.240:00"), TTime("00:00:24.640:00"), "Opgaveløsning"),
        T(TTime("00:00:25.120:00"), TTime("00:00:27.320:00"), "TJEK"),
        T(TTime("00:00:39.080:00"), TTime("00:00:41.760:00"), "INTIALIZING... Default mode network"),
        T(TTime("00:00:54.840:00"), TTime("00:00:55.880:00"), "Første skoledag"),
        T(TTime("00:01:53.160:00"), TTime("00:01:56.040:00"), "Hjernen - Kreativitet - Indlæring"),
        T(TTime("00:01:56.200:00"), TTime("00:01:57.680:00"), "Instragram - Notifikation"),
        T(TTime("00:01:57.680:00"), TTime("00:02:00.360:00"), "Instragram - 5 notifikationer"),
        T(TTime("00:02:00.360:00"), TTime("00:02:00.880:00"), "Instragram - 6 notifikationer"),
        T(TTime("00:02:11.240:00"), TTime("00:02:17.360:00"), "TJEK - Produceret af Videnskab.dk")
        ]
    }
};

/**
 * Takes up to 4 values 
 * 4 values: [0]hours[1]minutes[2]seconds[3]frames
 * 3 values: [0]minutes[1]seconds[2]frames
 * 2 values: [0]seconds[1]frames
 * 1 value : [0]frames
 */
function ATime() {
	var frames = 0;
	var seconds = 0;
	var minutes = 0;
	var hours = 0;
	if (arguments.length == 1) {
		frames = (arguments[0] * 1) / 24;
	}
	else if (arguments.length == 2) {
		frames = (arguments[1] * 1) / 24;
		seconds = arguments[0] * 1;
	}
	else if (arguments.length == 3) {
		frames = (arguments[2] * 1) / 24;
		seconds = arguments[1] * 1;
		minutes = (arguments[0] * 1) * 60;
	}
	else if (arguments.length == 4) {
		frames = (arguments[3] * 1) / 24;
		seconds = arguments[2] * 1;
		minutes = (arguments[1] * 1) * 60;
		hours = (arguments[0] * 1) * 3600;
	}
	else {
		return 0;
	}
	return hours + minutes + seconds + frames;
}

/**
 * If value is undefined returns 0
 * *//*@param {*} value *//*
 */
function UndefinedToZero(value) {
	if (typeof value === "undefined") {
		return 0;
	}
	return value;
}

/**
 * Convert input to seconds
 //* @param {numeric} frames Not Required
 //* @param {numeric} seconds Not Required
 //* @param {numeric} minutes Not Required
 //* @param {numeric} hours Not Required
 */

function _Time(frames, seconds, minutes, hours) {
	frames = UndefinedToZero(frames) / 24;
	seconds = UndefinedToZero(seconds);
	minutes = UndefinedToZero(minutes) * 60;
	hours = UndefinedToZero(hours) * 3600;
	return hours + minutes + seconds + frames;
}

/**
 * Convert string input "00:00:00:00" to seconds
 * @param {string} value Required
 */
function TTime(value) {
	if (typeof value === "undefined") {
		value = "00:00:00:00";
	}
	var split = value.split(":");
	var frames = (split[3] * 1) / 24;
	var seconds = split[2] * 1;
	var minutes = (split[1] * 1) * 60;
	var hours = (split[0] * 1) * 3600;
	var output = hours + minutes + seconds + frames;
	return output;
}

function T(start, end, text) {
	return {
		start: start,
		end: end,
		text: text
	};
}