// midiMappings.js
const midiMappings = {
    noteOn: {
      '0-0': { action: 'playPause', deck: 1 }, // Left Play/Pause (Channel 0)
      '0-1': { action: 'playPause', deck: 2 }, // Right Play/Pause (Channel 1)
      // Dodaj kolejne mapowania przycisków
    '1-0': { action: 'cuePress', deck: 1 }, // CUE button deck 1
    '1-1': { action: 'cuePress', deck: 2 }, // CUE button deck 2
    },
    noteOff: {
     '1-0': { action: 'cueRelease', deck: 1 }, // CUE release deck 1
    '1-1': { action: 'cueRelease', deck: 2 }, // CUE release deck 2
    },
    controlChange: {
        '28-0': { action: 'volume', deck: 1 }, // Suwak głośności dla deck 1
        '28-1': { action: 'volume', deck: 2 }, // Suwak głośności dla deck 2
      },
  };
  
  export default midiMappings;
  