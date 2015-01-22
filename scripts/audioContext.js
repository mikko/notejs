define([], function() 
{
	var audioContext = new AudioContext();
	// Require should handle the caching and thus make this a singleton
	return audioContext;
});