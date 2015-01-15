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
      console.log("Please do not schedule in the past");
      return 0;
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
    console.log("Scheduling track", index);
    var track = this.tracks[index];
    // TODO: lazy calc?
    track.sequenceLength = track.s.reduce(function(memo, s) { return memo + s.time;}, 0);
    track.prevStart = ac.currentTime;
    this.playNotes(track.i, track.s);
    track.nextStart = track.prevStart + track.sequenceLength;
    
    
    if (!track.kill) {
      
      // TODO: Forget timeouts and use scriptprocessor instead
      console.log("Should schedule next iteration in", track.sequenceLength * 1000);
      var nextEvenStroke = (t - t % p._strokeTime) + p._strokeTime;
      
      setTimeout(function() { console.log("Kukkuu"); }, track.sequenceLength * 1000);

    }
  };

 this.playNotes = function(startTime, instrument, notes) {
    // Divide to strokes
    var timeOffset = 0;
    notes.forEach(function(s) {
      instrument.play(s.note, startTime + timeOffset + s.time, s.time);
      timeOffset += s.time;
    });
  };

  this.playTime = function() {
    return this.pointZero === 0 ? 0 : ac.currentTime - this.pointZero;
  }

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
    if (arguments.length < 2 || !this._validateInstrument(instrument) || !this._validateSequence(sequence)) {
      console.log("Error adding track");
      return false;
    }
    var index = this.tracks.push({ i: instrument, s: sequence});
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
    if (Array.isArray(s) && s.length > 0) {
      return s.reduce(function(memo, val) { return memo && (val.time !== undefined && val.note !== undefined); }, true);
    }
    console.log("Invalid sequence");
    return false;
  };

  this._printSplash = function() {
    var message = [
      "*****",
      "Welcome",
      "*****",
      "Usage: TODO"].join("\n");
    console.log(message);
  };
  this._printSplash();
}

var p = new Player(ac);