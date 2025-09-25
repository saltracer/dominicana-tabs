// Mock AsyncStorage for Jest tests
jest.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
    getAllKeys: jest.fn(() => Promise.resolve([])),
    multiGet: jest.fn(() => Promise.resolve([])),
    multiSet: jest.fn(() => Promise.resolve()),
    multiRemove: jest.fn(() => Promise.resolve()),
  },
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

// Mock Platform for tests
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: jest.fn((obj) => obj.ios || obj.default),
}));

// Mock Readium native module for unit tests
jest.mock('react-native-readium', () => {
  const MockComponent = ({ children }) => children || null;
  return {
    ReadiumView: MockComponent,
    Reader: MockComponent,
  };
});

// Mock the services that depend on AsyncStorage
jest.mock('./services/ComplineService', () => ({
  ComplineService: {
    getInstance: jest.fn(() => ({
      getComplineForDate: jest.fn(() => Promise.resolve({
        id: 'test-id',
        components: {
          hymn: { title: { en: { text: 'Test Hymn' } } }
        }
      })),
      preloadComplineData: jest.fn(() => Promise.resolve())
    }))
  }
}));

jest.mock('./services/OfflineManager', () => ({
  OfflineManager: {
    getInstance: jest.fn(() => ({
      getCacheInfo: jest.fn(() => Promise.resolve({
        size: 100,
        maxSize: 1000,
        audioFiles: 5,
        complineEntries: 10
      })),
      clearCache: jest.fn(() => Promise.resolve())
    }))
  }
}));
