define([
	"audioContext",
	"envelope",
], function(
    ac,
	envelope
) {
    var sine = function() {
        var sine = ac.createOscillator();
        var amp = ac.createGain();
        sine.connect(amp);
        amp.connect(ac.destination);
        return { 
            node: sine, 
            amp: amp 
        };
    };

    var freq = function(halfSteps) {
        return Math.pow(Math.pow(2, 1/12), halfSteps) * 220;
    }

    // Each instrument should include propertie
    // AudioNode node: giving the output node not connected to anywhere
    // function(note, time, length) play: function for scheduling a note
    return { 
        createSineADSR: function(attack, decay, sustain, release) {
            var s = sine();
            s.amp.gain.setValueAtTime(0, ac.currentTime);
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
        }
    };
});