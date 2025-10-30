import { RssFeedService } from '../../services/RssFeedService';
import {
  keys,
  getJson,
  setJson,
  hashString,
  ensureImageCached,
  ensureAudioDownloaded,
  deleteAudioFile,
  deleteAllAudioForFeed,
  deleteImageByUrl,
  getUsage as getUsageStorage,
  deleteAllPodcastData,
  audioDirForFeed,
  getFileSize,
  dirSize,
  imagePathForUrl,
  fileExists,
} from './storage';

type FeedSummary = {
  title: string;
  description?: string;
  author?: string;
  artworkUrl?: string;
  websiteUrl?: string;
  language?: string;
  categories: string[];
};

export type FeedCache = {
  feedId: string;
  uri: string;
  fetchedAt: number;
  etag?: string | null;
  lastModified?: string | null;
  xmlHash?: string | null;
  summary: FeedSummary;
};

export type EpisodeCache = {
  id: string; // prefer GUID, fallback to audioUrl hash
  title: string;
  description?: string;
  audioUrl: string;
  localAudioPath?: string; // present if downloaded
  duration?: number;
  publishedAt?: string;
  episodeNumber?: number;
  seasonNumber?: number;
  guid: string;
  artworkUrl?: string;
  fileSize?: number;
  mimeType?: string;
  updatedAt: number;
};

type EpisodesMap = Record<string, EpisodeCache>;

type CuratedCache = {
  items: unknown[];
  updatedAt: number;
  listVersion?: string;
};

const ONE_HOUR_MS = 60 * 60 * 1000;

export async function getFeed(feedId: string): Promise<FeedCache | null> {
  const feed = await getJson<FeedCache>(keys.feed(feedId));
  return feed || null;
}

export async function getEpisodesMap(feedId: string): Promise<EpisodesMap> {
  const map = await getJson<EpisodesMap>(keys.episodes(feedId));
  return map || {};
}

export async function getEpisode(feedId: string, episodeId: string): Promise<EpisodeCache | null> {
  const map = await getEpisodesMap(feedId);
  return map[episodeId] || null;
}

export async function saveFeedSource(feedId: string, uri: string): Promise<void> {
  const existing = await getFeed(feedId);
  const next: FeedCache = existing ?? {
    feedId,
    uri,
    fetchedAt: 0,
    etag: null,
    lastModified: null,
    xmlHash: null,
    summary: { title: '', categories: [] },
  };
  next.uri = uri;
  await setJson(keys.feed(feedId), next);
}

export async function refreshFeed(
  feedId: string,
  uri: string,
  opts?: { force?: boolean }
): Promise<FeedCache>
{
  const now = Date.now();
  const existing = (await getFeed(feedId)) ?? {
    feedId,
    uri,
    fetchedAt: 0,
    etag: null,
    lastModified: null,
    xmlHash: null,
    summary: { title: '', categories: [] },
  } as FeedCache;

  const isFresh = !opts?.force && now - (existing.fetchedAt || 0) < ONE_HOUR_MS;
  if (isFresh) return existing;

  // Conditional request
  const headers: Record<string, string> = {};
  if (existing.etag) headers['If-None-Match'] = existing.etag;
  if (existing.lastModified) headers['If-Modified-Since'] = existing.lastModified;

  const res = await fetch(uri, { headers });

  if (res.status === 304) {
    const updated = { ...existing, fetchedAt: now } as FeedCache;
    await setJson(keys.feed(feedId), updated);
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log(`[podcast-cache] feed ${feedId} 304 not modified`);
    }
    return updated;
  }

  if (!res.ok) {
    // Keep previous cache on failure
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log(`[podcast-cache] feed ${feedId} fetch failed ${res.status}`);
    }
    return existing;
  }

  const xml = await res.text();
  const nextHash = await hashString(xml);

  const etag = res.headers.get('ETag');
  const lastModified = res.headers.get('Last-Modified');

  // If validators absent and body unchanged, just bump fetchedAt
  const unchanged = !etag && !lastModified && existing.xmlHash && nextHash === existing.xmlHash;
  if (unchanged) {
    const bumped = { ...existing, fetchedAt: now } as FeedCache;
    await setJson(keys.feed(feedId), bumped);
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log(`[podcast-cache] feed ${feedId} xml unchanged`);
    }
    return bumped;
  }

  // Parse and upsert episodes
  const parsed = RssFeedService.parseRssXml(xml);
  const summary: FeedSummary = {
    title: parsed.title,
    description: parsed.description,
    author: parsed.author,
    artworkUrl: parsed.artworkUrl,
    websiteUrl: parsed.websiteUrl,
    language: parsed.language,
    categories: parsed.categories ?? [],
  };

  const prevEpisodes = await getEpisodesMap(feedId);
  const nextEpisodes: EpisodesMap = {};
  const updatedAt = Date.now();

  // Upsert current episodes
  const currentIds: string[] = [];
  for (const ep of parsed.episodes) {
    const id = ep.guid || (await hashString(ep.audioUrl));
    currentIds.push(id);
    const prev = prevEpisodes[id];
    nextEpisodes[id] = {
      id,
      title: ep.title,
      description: ep.description,
      audioUrl: ep.audioUrl,
      duration: ep.duration,
      publishedAt: ep.publishedAt,
      episodeNumber: ep.episodeNumber,
      seasonNumber: ep.seasonNumber,
      guid: ep.guid,
      artworkUrl: ep.artworkUrl,
      fileSize: ep.fileSize,
      mimeType: ep.mimeType,
      updatedAt: prev ? prev.updatedAt : updatedAt,
    };
  }

  // Preserve updatedAt for unchanged episodes, mark updated ones now
  for (const id of currentIds) {
    const prev = prevEpisodes[id];
    const next = nextEpisodes[id];
    const changed =
      !prev ||
      prev.title !== next.title ||
      prev.description !== next.description ||
      prev.audioUrl !== next.audioUrl ||
      prev.duration !== next.duration ||
      prev.publishedAt !== next.publishedAt ||
      prev.episodeNumber !== next.episodeNumber ||
      prev.seasonNumber !== next.seasonNumber ||
      prev.guid !== next.guid ||
      prev.artworkUrl !== next.artworkUrl ||
      prev.fileSize !== next.fileSize ||
      prev.mimeType !== next.mimeType;
    if (changed) {
      next.updatedAt = updatedAt;
    } else if (prev) {
      next.updatedAt = prev.updatedAt;
    }
  }

  await setJson(keys.episodes(feedId), nextEpisodes);

  const updated: FeedCache = {
    feedId,
    uri,
    fetchedAt: now,
    etag: etag || null,
    lastModified: lastModified || null,
    xmlHash: nextHash,
    summary,
  };

  await setJson(keys.feed(feedId), updated);
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log(`[podcast-cache] feed ${feedId} updated with ${parsed.episodes.length} episodes`);
  }
  return updated;
}

// Image caching for episode or feed artwork
export async function cacheEpisodeImageIfNeeded(feedId: string, episodeId: string): Promise<string | null> {
  const map = await getEpisodesMap(feedId);
  const ep = map[episodeId];
  if (!ep || !ep.artworkUrl) return null;
  const { path } = await ensureImageCached(ep.artworkUrl);
  return path;
}

export async function prefetchEpisodes(
  feedId: string,
  count: number = 3,
  opts?: { downloadAudio?: boolean }
): Promise<void>
{
  const map = await getEpisodesMap(feedId);
  const episodes = Object.values(map)
    .sort((a, b) => (b.publishedAt ? Date.parse(b.publishedAt) : 0) - (a.publishedAt ? Date.parse(a.publishedAt) : 0))
    .slice(0, Math.max(0, count));

  for (const ep of episodes) {
    if (ep.artworkUrl) {
      await ensureImageCached(ep.artworkUrl);
    }
  }

  if (opts?.downloadAudio) {
    for (const ep of episodes) {
      await downloadEpisodeAudio(feedId, ep.id);
    }
  }
}

export async function getCurated(): Promise<CuratedCache | null> {
  const cached = await getJson<CuratedCache>(keys.curatedIndex());
  return cached || null;
}

export async function refreshCurated<T = unknown>(
  load: () => Promise<{ items: T[]; listVersion?: string }>,
  opts?: { force?: boolean }
): Promise<CuratedCache>
{
  const now = Date.now();
  const existing = await getCurated();
  const stale = !existing || now - existing.updatedAt >= 60 * 60 * 1000;
  if (!opts?.force && !stale && existing) return existing;
  const { items, listVersion } = await load();
  const next: CuratedCache = { items, listVersion, updatedAt: now };
  await setJson(keys.curatedIndex(), next);
  return next;
}

export async function getUsage() {
  return getUsageStorage();
}

export async function deleteFeedData(feedId: string, kind: 'audio' | 'images' | 'all' = 'all'): Promise<void> {
  const map = await getEpisodesMap(feedId);
  if (kind === 'audio' || kind === 'all') {
    await deleteAllAudioForFeed(feedId);
  }
  if (kind === 'images' || kind === 'all') {
    const urls = Array.from(new Set(Object.values(map).map((e) => e.artworkUrl).filter(Boolean) as string[]));
    for (const url of urls) {
      await deleteImageByUrl(url);
    }
  }
}

export async function deleteAll(): Promise<void> {
  await deleteAllPodcastData();
}

export async function getFeedUsage(feedId: string): Promise<{ audioBytes: number; imageBytes: number }>{
  // Audio usage: exact size of the feed's audio directory
  const audioBytes = await dirSize(audioDirForFeed(feedId));

  // Image usage: sum sizes for episode and feed artwork files if present in cache
  const episodes = await getEpisodesMap(feedId);
  const urlSet = new Set<string>();
  for (const ep of Object.values(episodes)) {
    if (ep.artworkUrl) urlSet.add(ep.artworkUrl);
  }
  if (urlSet.size === 0) {
    const feed = await getFeed(feedId);
    if (feed?.summary.artworkUrl) urlSet.add(feed.summary.artworkUrl);
  }
  let imageBytes = 0;
  for (const url of urlSet) {
    const path = imagePathForUrl(url);
    if (await fileExists(path)) {
      imageBytes += await getFileSize(path);
    }
  }
  return { audioBytes, imageBytes };
}

// Audio download integration that persists local path into episode cache
export async function downloadEpisodeAudio(
  feedId: string,
  episodeId: string,
  onProgress?: (p: { totalBytesWritten: number; totalBytesExpectedToWrite: number }) => void
): Promise<string>
{
  const map = await getEpisodesMap(feedId);
  const ep = map[episodeId];
  if (!ep) throw new Error('Episode not found');
  if (ep.localAudioPath) return ep.localAudioPath;

  const { path } = await ensureAudioDownloaded(feedId, episodeId, ep.audioUrl, 'mp3', onProgress);
  const next: EpisodeCache = { ...ep, localAudioPath: path, updatedAt: Date.now() };
  map[episodeId] = next;
  await setJson(keys.episodes(feedId), map);
  return path;
}


