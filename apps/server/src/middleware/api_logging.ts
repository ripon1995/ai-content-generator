import morgan from 'morgan';
import { morganStream } from '../utils/logger';

// api-logging : custom token
morgan.token('remote-addr', (req) => {
  return req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown';
});

// api logging : custom format
const morganFormat = ':remote-addr :method :url :status :res[content-length] - :response-time ms';

// api logging : base morgan logger
export const httpLogger = morgan(morganFormat, {
  stream: morganStream,
  // api logging : skip for production with 200 codes endpoint
  skip: (_, res) => {
    const isProduction = process.env.NODE_ENV === 'production';
    return isProduction && res.statusCode === 200;
  },
});
