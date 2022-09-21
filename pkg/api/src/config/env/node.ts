type EnvConfig = {
    nodeEnv: string;
    isProduction: boolean;
    isDevelopment: boolean;
};

const allowEnv: string[] = ['development', 'production'];

process.env.NODE_ENV = process.env.NODE_ENV && allowEnv.includes((process.env.NODE_ENV).toLocaleLowerCase()) ?
  (process.env.NODE_ENV).toLocaleLowerCase() : 'development';

const envConfig: EnvConfig = {
  nodeEnv: process.env.NODE_ENV,
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production'
};

export default envConfig;
