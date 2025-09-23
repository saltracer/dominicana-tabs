import { renderHook, act } from '@testing-library/react-hooks';
import { useComplineData } from '../useComplineData';
import { ComplineService } from '../../services/ComplineService';
import { ComplineData } from '../../types/compline-types';

// Mock the service
jest.mock('../../services/ComplineService');
const MockedComplineService = ComplineService as jest.MockedClass<typeof ComplineService>;

describe('useComplineData', () => {
  const mockComplineData: ComplineData = {
    id: 'test-id',
    version: '1.0.0',
    lastUpdated: '2024-01-01',
    season: { name: 'Ordinary Time', color: 'green' },
    rank: 'ferial',
    metadata: {
      title: { en: { text: 'Test Compline' } },
      description: { en: { text: 'Test description' } }
    },
    components: {
      opening: {
        content: { en: { text: 'Opening content' } }
      },
      examinationOfConscience: {
        content: { en: { text: 'Examination content' } },
        rubric: { en: { text: 'Examination rubric' } }
      },
      hymn: {
        title: { en: { text: 'Test Hymn' } },
        content: { en: { text: 'Hymn content' } }
      },
      psalmody: {
        psalmNumber: '4',
        antiphon: { en: { text: 'Test antiphon' } },
        verses: { en: { text: 'Test verses' } }
      },
      reading: {
        source: { en: { text: 'Test source' } },
        content: { en: { text: 'Test reading' } }
      },
      responsory: {
        content: { en: { text: 'Test responsory' } }
      },
      canticle: {
        antiphon: { en: { text: 'Test canticle antiphon' } },
        content: { en: { text: 'Test canticle content' } }
      },
      concludingPrayer: {
        content: { en: { text: 'Test prayer' } }
      },
      finalBlessing: {
        content: { en: { text: 'Test blessing' } }
      }
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load data successfully', async () => {
    const mockService = {
      getComplineForDate: jest.fn().mockResolvedValue(mockComplineData)
    } as unknown as ComplineService;
    
    MockedComplineService.getInstance.mockReturnValue(mockService);

    const { result } = renderHook(() => useComplineData(mockService));

    expect(result.current.loading).toBe(false);
    expect(result.current.complineData).toBeNull();
    expect(result.current.error).toBeNull();

    await act(async () => {
      await result.current.loadComplineData(new Date('2024-01-15'));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.complineData).toBeDefined();
    expect(result.current.complineData?.id).toBe('test-id');
    expect(result.current.error).toBeNull();
  });

  it('should handle service initialization failure', async () => {
    const { result } = renderHook(() => useComplineData(null));

    await act(async () => {
      await result.current.loadComplineData(new Date('2024-01-15'));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.complineData).toBeNull();
    expect(result.current.error).toBe('Service initialization failed');
  });

  it('should handle data loading error', async () => {
    const mockService = {
      getComplineForDate: jest.fn().mockRejectedValue(new Error('Network error'))
    } as unknown as ComplineService;

    const { result } = renderHook(() => useComplineData(mockService));

    await act(async () => {
      await result.current.loadComplineData(new Date('2024-01-15'));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.complineData).toBeNull();
    expect(result.current.error).toBe('Network error');
  });

  it('should handle non-Error exceptions', async () => {
    const mockService = {
      getComplineForDate: jest.fn().mockRejectedValue('String error')
    } as unknown as ComplineService;

    const { result } = renderHook(() => useComplineData(mockService));

    await act(async () => {
      await result.current.loadComplineData(new Date('2024-01-15'));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.complineData).toBeNull();
    expect(result.current.error).toBe('Failed to load Compline data');
  });

  it('should use custom language option', async () => {
    const mockService = {
      getComplineForDate: jest.fn().mockResolvedValue(mockComplineData)
    } as unknown as ComplineService;

    const { result } = renderHook(() => useComplineData(mockService, { language: 'es' }));

    await act(async () => {
      await result.current.loadComplineData(new Date('2024-01-15'));
    });

    expect(mockService.getComplineForDate).toHaveBeenCalledWith(
      expect.any(Date),
      'es'
    );
  });
});
