import { devConfig } from './dev';

export const getConfig = () => {
  return {
    ...devConfig,
    // Add any environment-specific overrides here
  };
};

export { devConfig };
