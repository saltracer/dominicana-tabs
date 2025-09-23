import { renderHook, act } from '@testing-library/react-native';
import { useCompline } from '../useCompline';
import { useComplineServices } from '../useComplineServices';
import { useComplineCache } from '../useComplineCache';
import { useComplineData } from '../useComplineData';
import { useComplineDate } from '../useComplineDate';

// Mock the smaller hooks
jest.mock('../useComplineServices');
jest.mock('../useComplineCache');
jest.mock('../useComplineData');
jest.mock('../useComplineDate');

const MockedUseComplineServices = useComplineServices as jest.MockedFunction<typeof useComplineServices>;
const MockedUseComplineCache = useComplineCache as jest.MockedFunction<typeof useComplineCache>;
const MockedUseComplineData = useComplineData as jest.MockedFunction<typeof useComplineData>;
const MockedUseComplineDate = useComplineDate as jest.MockedFunction<typeof useComplineDate>;

describe('useCompline', () => {
  const mockComplineService = {
    preloadComplineData: jest.fn()
  } as any;

  const mockOfflineManager = {
    getCacheInfo: jest.fn()
  } as any;

  const mockComplineData = {
    id: 'test-id',
    components: {
      hymn: { title: { en: { text: 'Test Hymn' } } }
    }
  } as any;

  const mockCacheInfo = {
    size: 100,
    maxSize: 1000,
    audioFiles: 5,
    complineEntries: 10
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    MockedUseComplineServices.mockReturnValue({
      complineService: mockComplineService,
      offlineManager: mockOfflineManager,
      servicesError: null
    });

    MockedUseComplineDate.mockReturnValue({
      currentDate: new Date('2024-01-15'),
      targetDate: new Date('2024-01-15')
    });

    MockedUseComplineData.mockReturnValue({
      complineData: mockComplineData,
      loading: false,
      error: null,
      loadComplineData: jest.fn()
    });

    MockedUseComplineCache.mockReturnValue({
      cacheInfo: mockCacheInfo,
      refreshCacheInfo: jest.fn(),
      clearCache: jest.fn()
    });
  });

  it('should combine data from all hooks', () => {
    const { result } = renderHook(() => useCompline(new Date('2024-01-15')));

    expect(result.current.complineData).toBe(mockComplineData);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.cacheInfo).toBe(mockCacheInfo);
  });

  it('should combine service and data errors', () => {
    MockedUseComplineServices.mockReturnValue({
      complineService: null,
      offlineManager: mockOfflineManager,
      servicesError: 'Service failed'
    });

    MockedUseComplineData.mockReturnValue({
      complineData: null,
      loading: false,
      error: 'Data failed',
      loadComplineData: jest.fn()
    });

    const { result } = renderHook(() => useCompline(new Date('2024-01-15')));

    expect(result.current.error).toBe('Service failed'); // Service error takes precedence
  });

  it('should call loadComplineData with target date on mount', () => {
    const mockLoadComplineData = jest.fn();
    MockedUseComplineData.mockReturnValue({
      complineData: null,
      loading: true,
      error: null,
      loadComplineData: mockLoadComplineData
    });

    const targetDate = new Date('2024-01-20');
    MockedUseComplineDate.mockReturnValue({
      currentDate: new Date('2024-01-15'),
      targetDate
    });

    renderHook(() => useCompline(new Date('2024-01-20')));

    expect(mockLoadComplineData).toHaveBeenCalledWith(targetDate);
  });

  it('should call refresh and refreshCacheInfo when refresh is called', async () => {
    const mockLoadComplineData = jest.fn().mockResolvedValue(undefined);
    const mockRefreshCacheInfo = jest.fn().mockResolvedValue(undefined);

    MockedUseComplineData.mockReturnValue({
      complineData: mockComplineData,
      loading: false,
      error: null,
      loadComplineData: mockLoadComplineData
    });

    MockedUseComplineCache.mockReturnValue({
      cacheInfo: mockCacheInfo,
      refreshCacheInfo: mockRefreshCacheInfo,
      clearCache: jest.fn()
    });

    const { result } = renderHook(() => useCompline(new Date('2024-01-15')));

    await act(async () => {
      await result.current.refresh();
    });

    expect(mockLoadComplineData).toHaveBeenCalled();
    expect(mockRefreshCacheInfo).toHaveBeenCalled();
  });

  it('should call preloadData when autoPreload is enabled', () => {
    const mockPreloadComplineData = jest.fn().mockResolvedValue(undefined);
    mockComplineService.preloadComplineData = mockPreloadComplineData;

    const mockRefreshCacheInfo = jest.fn().mockResolvedValue(undefined);
    MockedUseComplineCache.mockReturnValue({
      cacheInfo: mockCacheInfo,
      refreshCacheInfo: mockRefreshCacheInfo,
      clearCache: jest.fn()
    });

    renderHook(() => useCompline(new Date('2024-01-15'), { autoPreload: true }));

    expect(mockPreloadComplineData).toHaveBeenCalledWith('en', 7);
  });

  it('should use custom language option', () => {
    const mockLoadComplineData = jest.fn();
    MockedUseComplineData.mockReturnValue({
      complineData: null,
      loading: true,
      error: null,
      loadComplineData: mockLoadComplineData
    });

    renderHook(() => useCompline(new Date('2024-01-15'), { language: 'es' }));

    expect(MockedUseComplineData).toHaveBeenCalledWith(mockComplineService, { language: 'es' });
  });

  it('should handle preloadData failure gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    mockComplineService.preloadComplineData.mockRejectedValue(new Error('Preload failed'));

    const mockRefreshCacheInfo = jest.fn().mockResolvedValue(undefined);
    MockedUseComplineCache.mockReturnValue({
      cacheInfo: mockCacheInfo,
      refreshCacheInfo: mockRefreshCacheInfo,
      clearCache: jest.fn()
    });

    const { result } = renderHook(() => useCompline(new Date('2024-01-15'), { autoPreload: true }));

    await act(async () => {
      await result.current.preloadData();
    });

    expect(consoleSpy).toHaveBeenCalledWith('Failed to preload Compline data:', expect.any(Error));
    
    consoleSpy.mockRestore();
  });

  it('should handle missing service in preloadData', async () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    MockedUseComplineServices.mockReturnValue({
      complineService: null,
      offlineManager: mockOfflineManager,
      servicesError: null
    });

    const { result } = renderHook(() => useCompline(new Date('2024-01-15')));

    await act(async () => {
      await result.current.preloadData();
    });

    expect(consoleSpy).toHaveBeenCalledWith('Cannot preload: ComplineService not available');
    
    consoleSpy.mockRestore();
  });
});
