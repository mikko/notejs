define([
    "lodash",
    "audioContext"
], function(
    _,
    ac
    ) {

    var Player = function(ac) {
        this.ac = ac; // Audio context
        this.tempo = 120; // BPM
        this.pointZero = 0; // Time in audio context pointing to the beginning of first stroke
        this.signature = [4,4]; // Time signature of the song
        this.metronome = true;
        this._currentStroke = 0;

        // Tracks are objects like:
        // { i: someInstrument, s: someSequence, kill: isThisKilledAfterThisLoop }
        this.tracks = [];

        this._strokeTime =  (60 / this.tempo) * (this.signature[0] * (1 / this.signature[1])) / 0.25; // Length of one stroke in seconds

        this._initMetronome = function(signature) {
            return _.range(signature[0]).map(function(i) { return { time: (signature[0] * (1 / signature[1])) / signature[0], note: i == 0 ? 3 :0 }; });
        };

        // Audio nodes
        this.compressor = ac.createDynamicsCompressor();
        this.compressor.name = "Player, Compressor";
        this.compressor.threshold.value = -50;
        this.compressor.knee.value = 40;
        this.compressor.ratio.value = 12;
        this.compressor.reduction.value = -20;
        this.compressor.attack.value = 0;
        this.compressor.release.value = 0.25;

        this.merger = ac.createChannelMerger();
        this.merger.name = "Player, Channel merger"
        this.merger.connect(this.compressor);
        this.compressor.connect(ac.destination);


        // TODO: detach this timer to separate module
        this._scheduled = [];

        this._scheduler = setInterval(function() {
            var now = ac.currentTime;
            this._scheduled.forEach(function(s) {
                if(s.time < now) {
                    s.callback();
                    var index = this._scheduled.indexOf(s);
                    this._scheduled.splice(index, 1);
                }
            }.bind(this));
        }.bind(this), 50);

        // This scheduler IS NOT ACCURATE ans is intended to be used in scheduling something roughly
        this.scheduleAudioTime = function(cb, time) {
            if (time < ac.currentTime) {
                console.log("Is it a good idea to schedule in the past");
            }
            this._scheduled.push({callback: cb, time: time});
            return time - ac.currentTime;
        };

        this.setSignature = function(s) { 
            signature = s;
            this._metronomeTrack = this._initMetronome(signature);
        };

        this.setSignature(this.signature);


        this._stroke = function() {

        };

        this._scheduleTrack = function(index) {
            var track = this.tracks[index];
            // TODO: lazy calc?
            track.sequenceLength = track.s.reduce(function(memo, s) { return memo + s.time;}, 0);
            track.nextStart = ac.currentTime;
            var playSequence = function() {
                this.playNotes(track.nextStart, track.i, track.s);
                track.nextStart = track.nextStart + track.sequenceLength;
                if (!track.kill) {
                    // TODO: check the seqLength and schedule accordingingly
                    this.scheduleAudioTime(playSequence, track.nextStart - (track.sequenceLength / 2));
                }
            }.bind(this);
            this.scheduleAudioTime(playSequence, track.nextStart);

        };

        this.playNotes = function(startTime, instrument, notes) {
            console.log("Playing notes");
            // Divide to strokes
            var timeOffset = 0;
            notes.forEach(function(s) {
                instrument.play(s.note, startTime + timeOffset + s.time, s.time);
                timeOffset += s.time;
            });
        };

        this.playTime = function() {
            return this.pointZero === 0 ? 0 : ac.currentTime - this.pointZero;
        };

        this.start = function() {
            if (this._metronomeTrack === undefined) {
                this._metronomeTrack = this._initMetronome(this.signature);
            }
            this.pointZero = ac.currentTime;
            this.tracks.forEach(function(t, i) {
                this._scheduleTrack(i);
            }.bind(this));
            this.beatCounter = setInterval(function() { 
                var stroke = Math.floor(ac.currentTime / p._strokeTime);
                if (this._currentstroke != stroke) {
                    //console.log("Stroke", stroke)
                    this._currentStroke = stroke;
                }
            }.bind(this), 500);
        };

        this.stop = function() {
            clearInterval(this.beatCounter);
        };

        // schedule a track played with instrument
        // starts playing in the next sweetspot
        //
        // instrument must have:
        // function play(note, time, length) where note is pitch, time is the timestamp the note starts to play and length is the note length in beats
        // property 'node' which is of type AudioNode and preferably not connected to any other node
        //
        // sequence must be an array of objects consisting of properties time and note
        this.add = function(instrument, sequence) {
            if (arguments.length < 2) {
                console.log("Error adding track");
                return false;
            }
            var validatedInstrument = this._validateInstrument(instrument);
            var validatedSequence = this._validateSequence(sequence);
            if (_.isEmpty(validatedSequence) || !validatedInstrument) {
                console.log("Error adding track");
                return false;
            }
            var index = this.tracks.push({ i: instrument, s: validatedSequence});
            // TODO: don't connect yet
            // TODO: check if playing already and schedule the track
            instrument.node.connect(this.merger);
            console.log("Track added as track", index);
        };

        this.remove = function(index) {
            if (this.tracks[index]) {
                return this.tracks.pop(index);
            }
        };

        this._validateInstrument = function(i) {
            var validInstrument =  
                i !== undefined && 
                i.play !== undefined && 
                typeof i.play === "function" && 
                i.node !== undefined &&
                typeof i.node.connect === "function";
            validInstrument ? "": console.log("Invalid instrument");
            return validInstrument;
        };

        this._validateSequence = function(s) {
            var validateAsObjects = function(seq) {
                return seq.reduce(function(memo, val) { return memo && (val.time !== undefined && val.note !== undefined); }, true);
            };

            if (Array.isArray(s) && s.length > 0) {
                var isValidObjectSequence = validateAsObjects(s);
                if (isValidObjectSequence) {
                    return s;
                }
                else {
                    // Check if sequence is given as a shorthanded form: [[1,0], [1,1]]
                    var processedShorthand = _.map(s, function(ar) { return { time: ar[0], note: ar[1] }; });
                    var validShorthandSequence = validateAsObjects(processedShorthand);
                    return validShorthandSequence ? processedShorthand: [];
                }
            }
            console.log("Invalid sequence");
            return [];
        };

        this._printSplash = function() {
            var message = [
                "*****",
                "Welcome",
                "*****",
                "Example usage:",
                "1. create a melody and rhythm",
                "var me = [[1,0],[1,4],[1,0],[1,5]];",
                "2. create an instrument",
                "var inst = i.createOscADSR(0.1, 1, 0.6, 2);",
                "3. add a track to player",
                "p.add(inst, me);",
                "4. start the player",
                "p.start();"
            ].join("\n");
            console.log(message);
        };
        this._printSplash();
    }

    return new Player(ac);
});
