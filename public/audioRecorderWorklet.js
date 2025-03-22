class AudioRecorderProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.recording = false;
    this.audioData = [];
    this.bufferSize = 0;
    
    // Handle messages from the main thread
    this.port.onmessage = (event) => {
      if (event.data.command === 'start') {
        this.recording = true;
        this.audioData = [];
        this.bufferSize = 0;
      } else if (event.data.command === 'stop') {
        this.recording = false;
        // Send any remaining data
        if (this.audioData.length > 0) {
          this.port.postMessage({
            eventType: 'data',
            audioData: this.audioData
          });
        }
        this.port.postMessage({ eventType: 'stop' });
      }
    };
  }

  process(inputs, outputs, parameters) {
    // Get the first input (mono)
    const input = inputs[0];
    if (!input || !input.length) return true;

    // If recording, store the audio data
    if (this.recording) {
      const channelData = input[0];
      if (channelData) {
        // Create a copy of the data since the input buffer will be reused
        const audioChunk = new Float32Array(channelData);
        this.audioData.push(audioChunk);
        this.bufferSize += audioChunk.length;

        // Send data periodically to avoid memory issues
        if (this.bufferSize >= 16000) { // Send every second worth of audio
          this.port.postMessage({
            eventType: 'data',
            audioData: this.audioData
          });
          this.audioData = [];
          this.bufferSize = 0;
        }
      }
    }

    return true;
  }
}

registerProcessor('audio-recorder-worklet', AudioRecorderProcessor);
