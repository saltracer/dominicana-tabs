import PlaylistService from '../services/PlaylistService';

jest.mock('../lib/supabase', () => {
  const fromMock = jest.fn();
  const select = jest.fn().mockReturnThis();
  const order = jest.fn().mockReturnThis();
  const insert = jest.fn().mockReturnThis();
  const update = jest.fn().mockReturnThis();
  const del = jest.fn().mockReturnThis();
  const eq = jest.fn().mockReturnThis();
  const single = jest.fn().mockReturnThis();
  const upsert = jest.fn().mockReturnThis();
  (fromMock as any).mockImplementation(() => ({ select, order, insert, update, delete: del, eq, single, upsert }));
  return { supabase: { from: fromMock } };
});

describe('PlaylistService', () => {
  it('getPlaylists calls supabase and returns list', async () => {
    const { supabase } = require('../lib/supabase');
    supabase.from().select.mockReturnValueOnce({ order: supabase.from().order, data: [{ id: 'p1', name: 'X' }], error: null });
    supabase.from().order.mockReturnValueOnce({ order: jest.fn(), data: [{ id: 'p1', name: 'X' }], error: null });
    supabase.from().order.mockReturnValueOnce({ data: [{ id: 'p1', name: 'X' }], error: null });
    const res = await PlaylistService.getPlaylists();
    expect(Array.isArray(res)).toBe(true);
  });

  it('addItem with episode_id builds payload', async () => {
    const { supabase } = require('../lib/supabase');
    supabase.from().insert.mockReturnValueOnce({ select: supabase.from().select, single: supabase.from().single, data: { id: 'i1' }, error: null });
    supabase.from().select.mockReturnValueOnce({ single: supabase.from().single, data: { id: 'i1' }, error: null });
    supabase.from().single.mockReturnValueOnce({ data: { id: 'i1' }, error: null });
    const item = await PlaylistService.addItem('pl1', { episode_id: 'e1' });
    expect(item).toBeTruthy();
  });

  it('addItem with external_ref builds payload', async () => {
    const { supabase } = require('../lib/supabase');
    supabase.from().insert.mockReturnValueOnce({ select: supabase.from().select, single: supabase.from().single, data: { id: 'i2' }, error: null });
    supabase.from().select.mockReturnValueOnce({ single: supabase.from().single, data: { id: 'i2' }, error: null });
    supabase.from().single.mockReturnValueOnce({ data: { id: 'i2' }, error: null });
    const item = await PlaylistService.addItem('pl1', { external_ref: { podcastId: 'p', guid: 'g' } as any });
    expect(item).toBeTruthy();
  });
});


