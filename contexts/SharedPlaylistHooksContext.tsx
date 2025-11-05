/**
 * Context for sharing expensive hooks across multiple EpisodeListItems
 * This prevents each list item from calling usePodcastDownloads() and usePlaylists()
 */

import React, { createContext, useContext, ReactNode } from 'react';

interface SharedDownloadHooks {
  isDownloadsEnabled: boolean;
  isEpisodeDownloaded: (episodeId: string) => boolean;
  getDownloadState: (episodeId: string) => any;
  downloadEpisode: (episode: any) => Promise<boolean>;
  deleteDownloadedEpisode: (episodeId: string) => Promise<boolean>;
}

interface SharedPlaylistsHooks {
  playlists: any[];
}

interface SharedPlaylistHooksContextValue {
  downloadHooks: SharedDownloadHooks | null;
  playlistsHooks: SharedPlaylistsHooks | null;
}

const SharedPlaylistHooksContext = createContext<SharedPlaylistHooksContextValue>({
  downloadHooks: null,
  playlistsHooks: null,
});

interface SharedPlaylistHooksProviderProps {
  children: ReactNode;
  downloadHooks: SharedDownloadHooks;
  playlistsHooks: SharedPlaylistsHooks;
}

export function SharedPlaylistHooksProvider({ 
  children, 
  downloadHooks, 
  playlistsHooks 
}: SharedPlaylistHooksProviderProps) {
  return (
    <SharedPlaylistHooksContext.Provider value={{ downloadHooks, playlistsHooks }}>
      {children}
    </SharedPlaylistHooksContext.Provider>
  );
}

export function useSharedPlaylistHooks() {
  return useContext(SharedPlaylistHooksContext);
}

