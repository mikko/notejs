define([], function() 
{
	var audioContext = new AudioContext();
	
	audioContext._audioTree = [];
	audioContext.audioTree = function() {
		var nodes = audioContext._audioTree.map(function(n) {
			return { 
				source: n.source.name ? n.source.name : n.source.constructor.name, 
				target: n.target.name ? n.target.name : n.target.constructor.name 
			};
		});
		return JSON.stringify(nodes, null, 2);
	};

	audioContext.destination.name = "Audio output";

	// Extending audioNode.connect for tracking connects externally
	AudioNode.prototype.connect = (function(_super) { 
		return function() {
			console.log("Connecting", this, "to", arguments[0]);
			var nodeExists = _.find(audioContext._audioTree, function(node) {
				return node.source === this && node.target === arguments[0];
			});
			if(!nodeExists) {
				audioContext._audioTree.push({source: this, target: arguments[0]});
			}
			return _super.apply(this, arguments);
		}
	})(AudioNode.prototype.connect);
	


	// Require should handle the caching and thus make this a singleton
	return audioContext;
});