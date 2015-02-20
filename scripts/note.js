define([
	"player",
	"instrument"
], function(
	player,
	instrument
) {
	return { 
		player: player,
		instrument: instrument,
		audioContext: player.ac
	};
});