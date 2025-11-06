/**
 * Polyfills for Node.js modules in the browser
 * This file must be loaded before any other modules
 */

import { Buffer } from 'buffer';

// Make Buffer globally available
(window as any).Buffer = Buffer;
(window as any).global = window;

console.log('Polyfills loaded: Buffer is now available globally');

