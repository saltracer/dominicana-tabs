import { renderHook } from '@testing-library/react';
import { useComplineServices } from '../useComplineServices';
import { ComplineService } from '../../services/ComplineService';
import { OfflineManager } from '../../services/OfflineManager';

// Mock the services
jest.mock('../../services/ComplineService');
jest.mock('../../services/OfflineManager');

const MockedComplineService = ComplineService as jest.MockedClass<typeof ComplineService>;
const MockedOfflineManager = OfflineManager as jest.MockedClass<typeof OfflineManager>;

describe('useComplineServices', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize services successfully', () => {
    const mockComplineService = {} as ComplineService;
    const mockOfflineManager = {} as OfflineManager;
    
    MockedComplineService.getInstance.mockReturnValue(mockComplineService);
    MockedOfflineManager.getInstance.mockReturnValue(mockOfflineManager);

    const { result } = renderHook(() => useComplineServices());

    expect(result.current.complineService).toBe(mockComplineService);
    expect(result.current.offlineManager).toBe(mockOfflineManager);
    expect(result.current.servicesError).toBeNull();
  });

  it('should handle ComplineService initialization failure', () => {
    MockedComplineService.getInstance.mockImplementation(() => {
      throw new Error('ComplineService failed');
    });
    MockedOfflineManager.getInstance.mockReturnValue({} as OfflineManager);

    const { result } = renderHook(() => useComplineServices());

    expect(result.current.complineService).toBeNull();
    expect(result.current.offlineManager).toBeDefined();
    expect(result.current.servicesError).toBe('ComplineService initialization failed');
  });

  it('should handle OfflineManager initialization failure', () => {
    MockedComplineService.getInstance.mockReturnValue({} as ComplineService);
    MockedOfflineManager.getInstance.mockImplementation(() => {
      throw new Error('OfflineManager failed');
    });

    const { result } = renderHook(() => useComplineServices());

    expect(result.current.complineService).toBeDefined();
    expect(result.current.offlineManager).toBeNull();
    expect(result.current.servicesError).toBeNull();
  });

  it('should handle both services failing', () => {
    MockedComplineService.getInstance.mockImplementation(() => {
      throw new Error('ComplineService failed');
    });
    MockedOfflineManager.getInstance.mockImplementation(() => {
      throw new Error('OfflineManager failed');
    });

    const { result } = renderHook(() => useComplineServices());

    expect(result.current.complineService).toBeNull();
    expect(result.current.offlineManager).toBeNull();
    expect(result.current.servicesError).toBe('ComplineService initialization failed');
  });
});
