import { MongoMemoryServer } from 'mongodb-memory-server';
import mongooseWorker from 'mongoose';

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
  await mongooseWorker.connect(mongoUri);
  
  try {
    const mongooseApi = require('../../../api/node_modules/mongoose');
    if (mongooseApi && mongooseWorker !== mongooseApi) {
      await mongooseApi.connect(mongoUri);
    }
  } catch (e) {
    // Ignore if not found
  }
}, 60000);

afterAll(async () => {
  await mongooseWorker.disconnect();
  try {
    const mongooseApi = require('../../../api/node_modules/mongoose');
    if (mongooseApi && mongooseWorker !== mongooseApi) {
      await mongooseApi.disconnect();
    }
  } catch (e) {
    // Ignore
  }
  await mongoServer.stop();
});


