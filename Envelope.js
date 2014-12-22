var Envelope = function(ac, attack, decay, sustain, release) {
  this.context = ac;
  this.attack = attack;
  this.decay = release;
  this.sustain = sustain;
  this.release = release;

  this.trigger = function() {
    console.log(this.context, this.attack, this.release, this.param);
    now = this.context.currentTime;
    this.param.cancelScheduledValues(now);
    this.param.setValueAtTime(0, now);
    this.param.linearRampToValueAtTime(1, now + this.attack);
    this.param.linearRampToValueAtTime(sustain, now + this.attack + this.decay);
    this.param.linearRampToValueAtTime(0, now + this.attack + this.decay + this.release);
  };

  this.connect = function(param) {
    this.param = param;
  };

  return this;
};