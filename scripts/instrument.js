define([
	"audioContext",
	"envelope",
], function(
    ac,
	Envelope
) {
    // TODO: create an ultimate synthesizer object with chainable api
    // like inst.oscType("sawtooth").envelope(0.1,0.4,0.8,2).filter("lowpass", 500)

    var sine = function() {
        var sine = ac.createOscillator();
        var amp = ac.createGain();
        sine.connect(amp);
        
        return { 
            node: sine, 
            amp: amp 
        };
    };

    var freq = function(halfSteps) {
        return Math.pow(Math.pow(2, 1/12), halfSteps) * 220;
    }

    // Each instrument should include properties
    // AudioNode node: giving the output node not connected to anywhere
    // function(note, time, length) play: function for scheduling a note
    return { 
        new: function() {
        	console.log("ASD");
        },
        createOscADSR: function createOscADSR(attack, decay, sustain, release, oscType) {
            var s = sine();
            // TODO: custom oscillator
            if (["sine", "square", "sawtooth", "triangle"].indexOf(oscType) !== -1) {
                s.node.type = oscType;
            }
            s.amp.gain.setValueAtTime(0, ac.currentTime);
            s.amp.name = "OscADSR amp";
            var e = new Envelope(ac, attack, decay, sustain, release);
            e.connect(s.amp.gain);
            s.node.start();
            var playFn =  function(note, time, length) { 
                if (arguments.length < 3) {
                    console.log("Missing parameters. Unable to play");
                    return;
                }
                s.node.frequency.setValueAtTime(freq(note), time)
                e.trigger(time, length); 
            };
            return {
                play: playFn,
                node: s.amp
            };
        },
        createDrum: function(decay, startFreq, endFreq, duration) {
			var decay = decay ? decay: 10;
			var start = start ? start: 200;
			var end = end ? end: 40;
			var duration = duration ? duration: 300;
			var sine = ac.createOscillator();
			sine.name = "Drum sine";
            var amp = ac.createGain();
			amp.name = "Drum amp";
            sine.type = "sine";
			sine.connect(amp);
			sine.noteOn(ac.currentTime);
			amp.gain.setValueAtTime(0, ac.currentTime);
            
            var playFn =  function(note, time, length) { 
				sine.frequency.setValueAtTime(start, time);
				sine.frequency.exponentialRampToValueAtTime(end, time + (1/decay));
				amp.gain.setValueAtTime(0, time);
				amp.gain.linearRampToValueAtTime(1, time + 0.001);
				amp.gain.setValueAtTime(1, time + 0.3 * duration);
				amp.gain.linearRampToValueAtTime(0, time + duration/1000);
            }

			return {
                play: playFn,
                node: amp
            };
        },
        createLPOsc: function(limit) {
            var osc = this.createOscADSR(0.2, 0.4, 0.2, 4, "sawtooth");
			var filter = ac.createBiquadFilter();
			filter.type = "lowpass";
			filter.frequency.value = limit;
			filter.gain.value = 25;

			osc.node.connect(filter);

            return {
                play: osc.play,
                node: filter
            };
        }
    };
});