import { renderHook } from '@testing-library/react-native';
import { useComplineDate } from '../useComplineDate';

describe('useComplineDate', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T10:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should use provided date when given', () => {
    const providedDate = new Date('2024-01-20T15:30:00Z');
    
    const { result } = renderHook(() => useComplineDate(providedDate));

    expect(result.current.targetDate).toEqual(providedDate);
    expect(result.current.currentDate).toEqual(new Date('2024-01-15T10:00:00Z'));
  });

  it('should use current date when no date provided', () => {
    const { result } = renderHook(() => useComplineDate());

    expect(result.current.targetDate).toEqual(new Date('2024-01-15T10:00:00Z'));
    expect(result.current.currentDate).toEqual(new Date('2024-01-15T10:00:00Z'));
  });

  it('should memoize current date to prevent infinite loops', () => {
    const { result, rerender } = renderHook(() => useComplineDate());

    const firstCurrentDate = result.current.currentDate;
    
    // Rerender the hook
    rerender();
    
    const secondCurrentDate = result.current.currentDate;
    
    // Current date should be the same (memoized)
    expect(firstCurrentDate).toBe(secondCurrentDate);
  });

  it('should update target date when provided date changes', () => {
    const firstDate = new Date('2024-01-20T15:30:00Z');
    const { result, rerender } = renderHook(
      ({ date }) => useComplineDate(date),
      { initialProps: { date: firstDate } }
    );

    expect(result.current.targetDate).toEqual(firstDate);

    const secondDate = new Date('2024-01-25T20:00:00Z');
    rerender({ date: secondDate });

    expect(result.current.targetDate).toEqual(secondDate);
  });
});
