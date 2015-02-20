require([
    "requireConfig",
    "note"
],function(
	config,
	note
){
	window.note = note;
	window.p = note.player;
	window.i = note.instrument;
	window.ac = note.audioContext;

	console.log(config);

	// Hacks
	window.scamstrument = {
		node: {
			connect: function(dest) {
		  		console.log("Scamstrument connected to node", dest);
			}
	  	},
		play: function(note, time, length) {
			setTimeout(function() { console.log("Scamstrument started playing note", note); }, time * 1000);
			//setTimeout(function() { console.log("Scamstrument stopped playing note", note); }, (time + length) * 1000);
		}
	};

	// 0,2,3,2,0,5,3,2,0,2,3,5,7,5,3,2,0,2,3,2,0,5,3,2,-1,0,2,3,5,7,3,2
	window.giana = _([ 0,2,3,2,0,5,3,2,0,2,3,5,7,5,3,2,0,2,3,2,0,5,3,2,-1,0,2,3,5,7,3,2]).map(function(v) { return [v, -5]; }).flatten().map(function(n) { return {time: 0.25, note: n}; }).value();
	window.gianaBase = _([ 0,0,0,0,-2,-2,-2,-2,-4,-4,-4,-4,-5,-5,-1,-1,]).map(function(v) { return [v - 12, 0]; }).flatten().map(function(n) { return {time: 0.5, note: n}; }).value();

});