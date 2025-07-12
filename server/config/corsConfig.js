import cors from 'cors';

const corsConfig = {
  origin: /http:\/\/localhost:\d+$/,
  credentials: true
};

export default cors(corsConfig);
