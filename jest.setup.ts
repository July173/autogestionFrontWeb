import '@testing-library/jest-dom';

// Optional: mock window.scrollTo used by some components
Object.defineProperty(window, 'scrollTo', { value: () => {}, writable: true });

// Polyfill TextEncoder/TextDecoder for MSW and other libs that expect them in Node
// Node's `util` provides these; attach to global when missing (Jest/jsdom env).
try {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const { TextEncoder, TextDecoder } = require('util');
	if (typeof (global as any).TextEncoder === 'undefined') (global as any).TextEncoder = TextEncoder;
	if (typeof (global as any).TextDecoder === 'undefined') (global as any).TextDecoder = TextDecoder;
} catch (e) {
	// nothing to do if require fails
}

// Polyfill fetch/Request/Response/Headers for msw in the Jest/node environment
try {
	// Use node-fetch v2 (CommonJS) if available
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const nodeFetch = require('node-fetch');
	if (nodeFetch) {
		if (typeof (global as any).fetch === 'undefined') (global as any).fetch = nodeFetch;
		if (typeof (global as any).Request === 'undefined') (global as any).Request = nodeFetch.Request;
		if (typeof (global as any).Response === 'undefined') (global as any).Response = nodeFetch.Response;
		if (typeof (global as any).Headers === 'undefined') (global as any).Headers = nodeFetch.Headers;
	}
} catch (e) {
	// ignore if node-fetch not installed or not require-able
}

// Minimal BroadcastChannel polyfill for msw in Jest/node environment
if (typeof (global as any).BroadcastChannel === 'undefined') {
	class SimpleBroadcastChannel {
		name: string;
		constructor(name: string) {
			this.name = name;
		}
		postMessage(_msg: unknown) {
			// no-op
		}
		close() {
			// no-op
		}
		addEventListener(_type: string, _listener: EventListenerOrEventListenerObject) {
			// no-op
		}
		removeEventListener(_type: string, _listener: EventListenerOrEventListenerObject) {
			// no-op
		}
	}
	(global as any).BroadcastChannel = SimpleBroadcastChannel;
}

// Polyfill web streams (ReadableStream/WritableStream) used by msw
try {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	require('web-streams-polyfill/ponyfill/es2018');
} catch (e) {
	// ignore if not installed
}

// Ensure the polyfilled stream constructors are on the global object
try {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const streams = require('web-streams-polyfill/ponyfill/es2018');
	if (streams) {
		if (typeof (global as any).ReadableStream === 'undefined' && streams.ReadableStream) (global as any).ReadableStream = streams.ReadableStream;
		if (typeof (global as any).WritableStream === 'undefined' && streams.WritableStream) (global as any).WritableStream = streams.WritableStream;
		if (typeof (global as any).TransformStream === 'undefined' && streams.TransformStream) (global as any).TransformStream = streams.TransformStream;
	}
} catch (e) {
	// ignore
}
