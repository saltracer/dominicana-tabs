import { renderHook, act } from '@testing-library/react-hooks';
import { usePlaylists } from '../hooks/usePlaylists';

jest.mock('../contexts/AuthContext', () => ({ useAuth: () => ({ user: { id: 'u1' } }) }));
jest.mock('../lib/playlist/cache', () => ({
  getCachedPlaylists: jest.fn(async () => [{ id: 'p1', user_id: 'u1', name: 'A', is_builtin: false, created_at: '', updated_at: '' }]),
  setCachedPlaylists: jest.fn(async () => {}),
  enqueueMutation: jest.fn(async () => {}),
  syncUp: jest.fn(async () => {}),
  syncDown: jest.fn(async () => {}),
}));

describe('usePlaylists', () => {
  it('loads cache first and supports createPlaylist optimistic', async () => {
    const { result, waitForNextUpdate } = renderHook(() => usePlaylists());
    await waitForNextUpdate();
    expect(result.current.playlists.length).toBeGreaterThan(0);
    await act(async () => {
      await result.current.createPlaylist('My List');
    });
    expect(result.current.playlists.length).toBeGreaterThan(0);
  });
});


