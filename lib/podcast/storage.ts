// Use legacy API to avoid deprecation errors on getInfoAsync/makeDirectoryAsync, etc.
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

// Core key prefixes and directories used by the podcast caching system
export const PODCAST_ASYNC_PREFIX = 'podcast:';
export const PODCAST_AUDIO_DIR = `${FileSystem.documentDirectory}podcasts/audio/`;
export const PODCAST_IMAGE_DIR = `${FileSystem.documentDirectory}podcasts/images/`;
export const PODCAST_TMP_DIR = `${FileSystem.documentDirectory}podcasts/tmp/`;

export type UsageBreakdown = {
  audioBytes: number;
  imageBytes: number;
};

export type DownloadProgress = {
  totalBytesWritten: number;
  totalBytesExpectedToWrite: number;
};

// Ensure base directories exist
export async function ensureBasePodcastDirs(): Promise<void> {
  await ensureDir(PODCAST_AUDIO_DIR);
  await ensureDir(PODCAST_IMAGE_DIR);
  await ensureDir(PODCAST_TMP_DIR);
}

export async function ensureDir(dirUri: string): Promise<void> {
  const info = await FileSystem.getInfoAsync(dirUri);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dirUri, { intermediates: true });
  }
}

// AsyncStorage helpers (JSON-safe)
export async function getJson<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setJson<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function removeKey(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}

export async function multiGetJson<T = unknown>(keys: string[]): Promise<Record<string, T | null>> {
  const entries = await AsyncStorage.multiGet(keys);
  const result: Record<string, T | null> = {};
  for (const [k, v] of entries) {
    if (v == null) {
      result[k] = null;
      continue;
    }
    try {
      result[k] = JSON.parse(v) as T;
    } catch {
      result[k] = null;
    }
  }
  return result;
}

// Key builders
export const keys = {
  feedsIndex: () => `${PODCAST_ASYNC_PREFIX}feeds:index`,
  feed: (feedId: string) => `${PODCAST_ASYNC_PREFIX}feed:${feedId}`,
  episodes: (feedId: string) => `${PODCAST_ASYNC_PREFIX}episodes:${feedId}`,
  curatedIndex: () => `${PODCAST_ASYNC_PREFIX}curated:index`,
  usage: () => `${PODCAST_ASYNC_PREFIX}usage`,
  settings: () => `${PODCAST_ASYNC_PREFIX}settings`,
};

// Path builders
export function audioDirForFeed(feedId: string): string {
  return `${PODCAST_AUDIO_DIR}${sanitize(feedId)}/`;
}

export function audioPath(feedId: string, episodeId: string, extension: string = 'mp3'): string {
  return `${audioDirForFeed(feedId)}${sanitize(episodeId)}.${extension}`;
}

export function imagePathForUrl(url: string): string {
  const name = hashForUrl(url);
  // Extension is not critical; use jpg for uniformity
  return `${PODCAST_IMAGE_DIR}${name}.jpg`;
}

export function tmpPath(filename: string): string {
  return `${PODCAST_TMP_DIR}${sanitize(filename)}`;
}

// Hashing utilities
export function hashForUrl(url: string): string {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, url).then((h) => h);
}

export async function hashString(value: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, value);
}

function sanitize(id: string): string {
  return id.replace(/[^a-zA-Z0-9_-]/g, '_');
}

// File operations
export async function fileExists(uri: string): Promise<boolean> {
  const info = await FileSystem.getInfoAsync(uri);
  return info.exists;
}

export async function getFileSize(uri: string): Promise<number> {
  const info = await FileSystem.getInfoAsync(uri);
  return info.exists && info.size != null ? info.size : 0;
}

export async function deleteFile(uri: string): Promise<void> {
  const exists = await fileExists(uri);
  if (exists) {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  }
}

export async function listFiles(dirUri: string): Promise<FileSystem.FileInfo[]> {
  const exists = await fileExists(dirUri);
  if (!exists) return [] as unknown as FileSystem.FileInfo[];
  const entries = await FileSystem.readDirectoryAsync(dirUri);
  const results: FileSystem.FileInfo[] = [] as unknown as FileSystem.FileInfo[];
  for (const name of entries) {
    const full = `${dirUri}${name}`;
    // getInfoAsync returns FileInfo; we collect minimal fields we need
    const info = await FileSystem.getInfoAsync(full);
    // @ts-expect-error expo types are permissive; we forward as-is
    results.push(info);
  }
  return results;
}

// Usage accounting
export async function getUsage(): Promise<UsageBreakdown> {
  const u = await getJson<UsageBreakdown>(keys.usage());
  if (u) return u;
  const fresh: UsageBreakdown = { audioBytes: 0, imageBytes: 0 };
  await setJson(keys.usage(), fresh);
  return fresh;
}

export async function setUsage(next: UsageBreakdown): Promise<void> {
  await setJson(keys.usage(), next);
}

export async function bumpAudioBytes(delta: number): Promise<void> {
  const u = await getUsage();
  u.audioBytes = Math.max(0, u.audioBytes + delta);
  await setUsage(u);
}

export async function bumpImageBytes(delta: number): Promise<void> {
  const u = await getUsage();
  u.imageBytes = Math.max(0, u.imageBytes + delta);
  await setUsage(u);
}

export async function recalcUsageByScan(): Promise<UsageBreakdown> {
  await ensureBasePodcastDirs();
  const audioTotal = await dirSizeRecursive(PODCAST_AUDIO_DIR);
  const imageTotal = await dirSizeRecursive(PODCAST_IMAGE_DIR);
  const next = { audioBytes: audioTotal, imageBytes: imageTotal };
  await setUsage(next);
  return next;
}

async function dirSizeRecursive(dirUri: string): Promise<number> {
  const exists = await fileExists(dirUri);
  if (!exists) return 0;
  const names = await FileSystem.readDirectoryAsync(dirUri);
  let total = 0;
  for (const name of names) {
    const full = `${dirUri}${name}`;
    const info = await FileSystem.getInfoAsync(full);
    if (info.isDirectory) {
      total += await dirSizeRecursive(`${full}/`);
    } else if (info.size) {
      total += info.size;
    }
  }
  return total;
}

// Download helpers
export async function downloadToFile(
  url: string,
  finalPath: string,
  onProgress?: (p: DownloadProgress) => void
): Promise<{ uri: string; size: number }>
{
  await ensureDir(finalPath.substring(0, finalPath.lastIndexOf('/') + 1));

  const temp = `${PODCAST_TMP_DIR}${await hashString(`${url}-${Date.now()}`)}`;
  await ensureDir(PODCAST_TMP_DIR);

  const callback = onProgress
    ? (dp: FileSystem.DownloadProgressData) => {
        onProgress({
          totalBytesExpectedToWrite: dp.totalBytesExpectedToWrite,
          totalBytesWritten: dp.totalBytesWritten,
        });
      }
    : undefined;

  const downloadResumable = FileSystem.createDownloadResumable(url, temp, {}, callback);
  const result = await downloadResumable.downloadAsync();
  if (!result || !result.uri) {
    // cleanup temp if present
    await deleteFile(temp);
    throw new Error('Download failed');
  }

  // Move into place
  await moveFile(temp, finalPath);
  const size = await getFileSize(finalPath);
  return { uri: finalPath, size };
}

export async function moveFile(fromUri: string, toUri: string): Promise<void> {
  await ensureDir(toUri.substring(0, toUri.lastIndexOf('/') + 1));
  await FileSystem.moveAsync({ from: fromUri, to: toUri });
}

// Image cache helpers
export async function ensureImageCached(url: string): Promise<{ path: string; bytesAdded: number }>{
  const hash = await hashString(url);
  const path = `${PODCAST_IMAGE_DIR}${hash}.jpg`;
  await ensureBasePodcastDirs();
  if (await fileExists(path)) return { path, bytesAdded: 0 };
  const { size } = await downloadToFile(url, path);
  await bumpImageBytes(size);
  return { path, bytesAdded: size };
}

// Audio cache helpers
export async function ensureAudioDownloaded(
  feedId: string,
  episodeId: string,
  url: string,
  extension: string = 'mp3',
  onProgress?: (p: DownloadProgress) => void
): Promise<{ path: string; bytesAdded: number }>
{
  const path = audioPath(feedId, episodeId, extension);
  await ensureBasePodcastDirs();
  if (await fileExists(path)) return { path, bytesAdded: 0 };
  const { size } = await downloadToFile(url, path, onProgress);
  await bumpAudioBytes(size);
  return { path, bytesAdded: size };
}

export async function deleteAudioFile(feedId: string, episodeId: string, extension: string = 'mp3'): Promise<number> {
  const path = audioPath(feedId, episodeId, extension);
  const size = await getFileSize(path);
  await deleteFile(path);
  if (size > 0) await bumpAudioBytes(-size);
  return size;
}

export async function deleteImageByUrl(url: string): Promise<number> {
  const hash = await hashString(url);
  const path = `${PODCAST_IMAGE_DIR}${hash}.jpg`;
  const size = await getFileSize(path);
  await deleteFile(path);
  if (size > 0) await bumpImageBytes(-size);
  return size;
}

// Per-feed deletion helpers (directories)
export async function deleteAllAudioForFeed(feedId: string): Promise<number> {
  const dir = audioDirForFeed(feedId);
  const exists = await fileExists(dir);
  if (!exists) return 0;
  const size = await dirSizeRecursive(dir);
  await FileSystem.deleteAsync(dir, { idempotent: true });
  await ensureDir(dir);
  if (size > 0) await bumpAudioBytes(-size);
  return size;
}

// Global deletion helpers
export async function deleteAllPodcastData(): Promise<UsageBreakdown> {
  // Remove files
  await Promise.all([
    FileSystem.deleteAsync(PODCAST_AUDIO_DIR, { idempotent: true }),
    FileSystem.deleteAsync(PODCAST_IMAGE_DIR, { idempotent: true }),
    FileSystem.deleteAsync(PODCAST_TMP_DIR, { idempotent: true }),
  ]);
  await ensureBasePodcastDirs();

  // Remove relevant AsyncStorage keys (keep settings)
  const allKeys = await AsyncStorage.getAllKeys();
  const podcastKeys = allKeys.filter((k) => k.startsWith(PODCAST_ASYNC_PREFIX) && k !== keys.settings());
  if (podcastKeys.length) await AsyncStorage.multiRemove(podcastKeys);

  const empty: UsageBreakdown = { audioBytes: 0, imageBytes: 0 };
  await setUsage(empty);
  return empty;
}

// Simple concurrency limiter for downloads/prefetch queues
export class TaskQueue {
  private readonly concurrency: number;
  private running = 0;
  private queue: Array<() => Promise<void>> = [];

  constructor(concurrency: number) {
    this.concurrency = Math.max(1, concurrency);
  }

  enqueue<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const run = async () => {
        this.running++;
        try {
          const result = await task();
          resolve(result);
        } catch (e) {
          reject(e);
        } finally {
          this.running--;
          this.shift();
        }
      };
      this.queue.push(run as unknown as () => Promise<void>);
      this.shift();
    });
  }

  private shift() {
    while (this.running < this.concurrency && this.queue.length > 0) {
      const next = this.queue.shift();
      if (next) void next();
    }
  }
}


