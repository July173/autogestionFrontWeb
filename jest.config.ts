import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/jest.env.setup.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^.+\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',
    '^.+\\.(png|jpg|jpeg|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
    '^@\\/(.*)$': '<rootDir>/src/$1',
    '^src\\/components\\/NotificationModal$': '<rootDir>/src/test-mocks/NotificationModalMock.tsx',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  // Transform some ESM modules under node_modules (msw and friends) so Jest can parse them
  transformIgnorePatterns: ['/node_modules/(?!(msw|@mswjs|until-async)/)'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.app.json',
    },
  },
};

export default config;
