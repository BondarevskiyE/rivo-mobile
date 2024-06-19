global.Buffer = require('buffer').Buffer;

// Needed so that 'stream-http' chooses the right default protocol.
global.location = {
  protocol: 'file:',
};

global.process.version = 'v16.0.0';
// global.event = require('custom-event-polyfill').default;
if (!global.process.version) {
  global.process = require('process');
  console.log({process: global.process});
}

process.browser = true;
