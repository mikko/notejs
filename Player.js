var Player = function(ac) {
  this.ac = ac; // Audio context
  this.tempo = 120; // BPM
  this.pointZero = 0; // Time in audio context pointing to the beginning of first stroke
  this.signature = [4,4]; // Time signature of the song
  this.metronome = true;
  // Tracks are objects like:
  // { i: someInstrument, s: someSequence, kill: isThisKilledAfterThisLoop }
  this.tracks = [];

  this._strokeTime =  (60 / this.tempo) * (this.signature[0] * (1 / this.signature[1])) / 0.25; // Length of one stroke in seconds

  this._initMetronome = function(signature) {
    return _.range(signature[0]).map(function(i) { return { time: (signature[0] * (1 / signature[1])) / signature[0], note: i == 0 ? 3 :0 }; });
  };

  this.setSignature = function(s) { 
    signature = s;
    this._metronomeTrack = this._initMetronome(signature);
  };

  this.setSignature(this.signature);

  
  this._stroke = function() {

  };

  this._scheduleTrack = function(index) {
    console.log("Scheduling track", index);
    var track = this.tracks[index];
    this.playNotes(track.i, track.s);
  };

 this.playNotes = function(instrument, notes) {
    // Divide to strokes
    // One stroke is always time worth of 1.0
    
    var timeOffset = 0;
    notes.forEach(function(s) {
      instrument.play(s.note, timeOffset + s.time, s.time);
      timeOffset += s.time;
    });
  };

  this.start = function() {
    if (this._metronomeTrack === undefined) {
      this._metronomeTrack = this._initMetronome(this.signature);
    }
    this.pointZero = ac.currentTime;
    this.tracks.forEach(function(t, i) {
      this._scheduleTrack(i);
    }.bind(this));
  };

  this.stop = function() {

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
    if (arguments.length < 2 || !this._validateInstrument(instrument) || !this._validateSequence(sequence)) {
      console.log("Error adding track");
      return false;
    }
    var index = this.tracks.push({ i: instrument, s: sequence});
    console.log("Track added as track", index);
  };

  this._validateInstrument = function(i) {
    return i !== undefined && i.play !== undefined && typeof i.play === "function" && i.node !== undefined;
  };

  this._validateSequence = function(s) {
    if (Array.isArray(s) && s.length > 0) {
      return s.reduce(function(memo, val) { return memo && (val.time !== undefined && val.note !== undefined); }, true);
    }
    return false;
  };

}

var p = new Player(ac);