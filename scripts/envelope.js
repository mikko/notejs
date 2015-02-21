define([], 
function() 
{
    var Envelope = function(ac, attack, decay, sustain, release) {
        this.context = ac;
        this.attack = attack;
        this.decay = release;
        this.sustain = sustain;
        this.release = release;

        this.trigger = function(triggerTime, noteLength) {
            this.param.cancelScheduledValues(triggerTime);
            this.param.linearRampToValueAtTime(0, triggerTime);
            this.param.linearRampToValueAtTime(1, triggerTime + this.attack);
            this.param.linearRampToValueAtTime(sustain, triggerTime + this.attack + this.decay);
            if (noteLength === undefined) {
                this.param.linearRampToValueAtTime(0, triggerTime + this.attack + this.decay + this.release);
            } else {
                // Ensure the note really ends after note length
                this.param.cancelScheduledValues(triggerTime + noteLength);
                this.param.linearRampToValueAtTime(0, triggerTime + noteLength);
            }
        };

        this.connect = function(param) {
            this.param = param;
        };

        return this;
    };

    return Envelope;
});