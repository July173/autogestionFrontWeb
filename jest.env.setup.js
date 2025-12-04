// Polyfills that must run BEFORE any test imports (msw imports require these globals)
try {
  const { TextEncoder, TextDecoder } = require('util');
  if (typeof global.TextEncoder === 'undefined') global.TextEncoder = TextEncoder;
  if (typeof global.TextDecoder === 'undefined') global.TextDecoder = TextDecoder;
} catch (e) {}

try {
  const nodeFetch = require('node-fetch');
  if (nodeFetch) {
    if (typeof global.fetch === 'undefined') global.fetch = nodeFetch;
    if (typeof global.Request === 'undefined') global.Request = nodeFetch.Request;
    if (typeof global.Response === 'undefined') global.Response = nodeFetch.Response;
    if (typeof global.Headers === 'undefined') global.Headers = nodeFetch.Headers;
  }
} catch (e) {}

// Minimal BroadcastChannel polyfill
if (typeof global.BroadcastChannel === 'undefined') {
  class SimpleBroadcastChannel {
    constructor(name) { this.name = name; }
    postMessage() {}
    close() {}
    addEventListener() {}
    removeEventListener() {}
  }
  global.BroadcastChannel = SimpleBroadcastChannel;
}

// Web streams polyfill
try {
  const streams = require('web-streams-polyfill/ponyfill/es2018');
  if (streams) {
    if (typeof global.ReadableStream === 'undefined' && streams.ReadableStream) global.ReadableStream = streams.ReadableStream;
    if (typeof global.WritableStream === 'undefined' && streams.WritableStream) global.WritableStream = streams.WritableStream;
    if (typeof global.TransformStream === 'undefined' && streams.TransformStream) global.TransformStream = streams.TransformStream;
  }
} catch (e) {}

// In case the ponyfill didn't attach, provide minimal stubs so msw can run in tests.
if (typeof global.WritableStream === 'undefined') {
  class StubWritableStream {
    constructor() {}
    getWriter() {
      return {
        write: async () => {},
        close: async () => {},
        releaseLock: () => {},
      };
    }
  }
  global.WritableStream = StubWritableStream;
}
if (typeof global.ReadableStream === 'undefined') {
  class StubReadableStream {
    constructor() {}
  }
  global.ReadableStream = StubReadableStream;
}
if (typeof global.TransformStream === 'undefined') {
  class StubTransformStream {
    constructor() {
      this.readable = new global.ReadableStream();
      this.writable = new global.WritableStream();
    }
  }
  global.TransformStream = StubTransformStream;
}
