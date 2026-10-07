import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

// Polyfills for pdfjs-dist in Node 22/24 environments where DOMMatrix is missing
if (typeof global.DOMMatrix === 'undefined') {
  global.DOMMatrix = class DOMMatrix {} as any;
}
if (typeof global.Path2D === 'undefined') {
  global.Path2D = class Path2D {} as any;
}


let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
