// src/components/MidiManager/MidiManager.js

import { WebMidi } from 'webmidi';
import { playPause, getDecks } from '../AudioManager/AudioControl'; // Adjust the path as necessary

class MidiManager {
  constructor() {
    this.controllerInput = null;
    this.controllerOutput = null;
    this.midiMappings = {};
  }

  async init() {
    try {
      await WebMidi.enable();
      console.log('WebMidi enabled!');
      console.log('Available MIDI Inputs:', WebMidi.inputs.map(input => input.name));
      console.log('Available MIDI Outputs:', WebMidi.outputs.map(output => output.name));

      // Replace with the exact controller name from the console logs
      const controllerName = 'Numark MixTrack Pro FX';

      this.controllerInput = WebMidi.getInputByName(controllerName);
      this.controllerOutput = WebMidi.getOutputByName(controllerName);

      if (this.controllerInput && this.controllerOutput) {
        console.log(`Connected to controller: ${controllerName}`);
        this.controllerInput.addListener('midimessage', 'all', this.handleMidiMessage.bind(this));
        this.setupMappings();
      } else {
        console.error(`Controller ${controllerName} not found.`);
      }
    } catch (err) {
      console.error('WebMidi could not be enabled:', err);
    }
  }

  handleMidiMessage(e) {
    const [status, data1, data2] = e.data;
    const key = `${status}-${data1}`;

    if (this.midiMappings[key]) {
      this.midiMappings[key](data2);
    } else {
      console.warn(`Unhandled MIDI message: ${status.toString(16)} ${data1.toString(16)} ${data2}`);
    }
  }

  registerMapping(key, handler) {
    this.midiMappings[key] = handler;
  }

  setupMappings() {
    // Map Play/Pause for Deck 1
    this.registerMapping('90-00', (data2) => { // '90' is 144 in hex
      if (data2 > 0) {
        playPause(1);
        const isPlaying = getDecks()[1]?.isPlaying || false;
        this.updatePlayButtonLED(1, isPlaying);
      }
    });

    // Map Play/Pause for Deck 2
    this.registerMapping('91-00', (data2) => { // '91' is 145 in hex
      if (data2 > 0) {
        playPause(2);
        const isPlaying = getDecks()[2]?.isPlaying || false;
        this.updatePlayButtonLED(2, isPlaying);
      }
    });

    // Add other mappings as needed
  }

  updatePlayButtonLED(deckNumber, isPlaying) {
    const status = 0x90 + (deckNumber - 1); // 0x90 for Deck 1, 0x91 for Deck 2
    const data1 = 0x00; // Play button note number
    const data2 = isPlaying ? 0x7F : 0x00; // Velocity (LED on/off)
    this.sendMidiMessage(status, data1, data2);
  }

  sendMidiMessage(status, data1, data2) {
    if (this.controllerOutput) {
      this.controllerOutput.send([status, data1, data2]);
      console.log(`Sent MIDI message: [${status}, ${data1}, ${data2}]`);
    } else {
      console.error('Controller output not available');
    }
  }
}

export default new MidiManager();
