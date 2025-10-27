/**
 * RSS Feed Service
 * Parses RSS/Atom feeds to extract podcast metadata and episodes
 */

import { XMLParser } from 'fast-xml-parser';
import { ParsedRssFeed, ParsedRssEpisode } from '../types/podcast-types';

export class RssFeedService {
  private static parser: XMLParser;

  private static getParser(): XMLParser {
    if (!RssFeedService.parser) {
      RssFeedService.parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
        parseAttributeValue: true,
        textNodeName: '#text',
        trimValues: true,
      });
    }
    return RssFeedService.parser;
  }

  /**
   * Parse RSS feed from URL
   */
  static async parseRssFeed(rssUrl: string): Promise<ParsedRssFeed> {
    try {
      // Fetch the RSS feed
      const response = await fetch(rssUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch RSS feed: ${response.statusText}`);
      }

      const xmlText = await response.text();
      return this.parseRssXml(xmlText);
    } catch (error) {
      console.error('Error parsing RSS feed:', error);
      throw new Error(`Failed to parse RSS feed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse RSS XML content
   */
  static parseRssXml(xmlText: string): ParsedRssFeed {
    const parser = this.getParser();
    const jsonObj = parser.parse(xmlText);

    // Handle both RSS and Atom formats
    if (jsonObj.rss) {
      return this.parseRssFormat(jsonObj.rss);
    } else if (jsonObj.feed) {
      return this.parseAtomFormat(jsonObj.feed);
    } else {
      throw new Error('Unsupported feed format');
    }
  }

  /**
   * Parse RSS 2.0 format
   */
  private static parseRssFormat(rss: any): ParsedRssFeed {
    const channel = rss.channel;
    
    // Extract podcast metadata
    const title = channel.title?.['#text'] || channel.title || '';
    const description = channel.description?.['#text'] || channel.description || channel['itunes:subtitle']?.['#text'] || '';
    const author = channel['itunes:author']?.['#text'] || channel['itunes:author'] || channel['dc:creator']?.['#text'] || '';
    const link = this.extractUrl(channel.link?.['#text'] || channel.link);
    const language = channel.language?.['#text'] || channel.language || 'en';
    
    // Extract artwork (iTunes Podcast RSS extension)
    const artworkUrl = this.extractArtwork(channel);
    
    // Extract categories
    const categories = this.extractCategories(channel);
    
    // Parse episodes
    const items = Array.isArray(channel.item) ? channel.item : [channel.item].filter(Boolean);
    const episodes: ParsedRssEpisode[] = items.map((item: any) => this.parseRssEpisode(item));
    
    return {
      title,
      description,
      author,
      artworkUrl,
      websiteUrl: link,
      language,
      categories,
      episodes,
      lastBuildDate: channel.lastBuildDate?.['#text'] || channel.lastBuildDate,
    };
  }

  /**
   * Parse Atom format
   */
  private static parseAtomFormat(feed: any): ParsedRssFeed {
    const title = feed.title?.['#text'] || feed.title || '';
    const description = feed.subtitle?.['#text'] || feed.subtitle || feed.description?.['#text'] || '';
    const author = feed.author?.name?.['#text'] || feed.author?.name || '';
    const link = this.extractAtomLink(feed.link);
    const language = feed['@_xml:lang'] || 'en';
    
    // Parse artwork from logo or icon
    const artworkUrl = feed.logo?.['#text'] || feed.logo || feed.icon?.['#text'] || feed.icon;
    
    // Parse episodes
    const entries = Array.isArray(feed.entry) ? feed.entry : [feed.entry].filter(Boolean);
    const episodes: ParsedRssEpisode[] = entries.map((entry: any) => this.parseAtomEntry(entry));
    
    return {
      title,
      description,
      author,
      artworkUrl,
      websiteUrl: link,
      language,
      categories: [],
      episodes,
    };
  }

  /**
   * Parse RSS episode/item
   */
  private static parseRssEpisode(item: any): ParsedRssEpisode {
    const title = item.title?.['#text'] || item.title || '';
    const description = item.description?.['#text'] || item.description || item['content:encoded']?.['#text'] || '';
    
    // Extract enclosure (audio URL)
    const enclosure = Array.isArray(item.enclosure) ? item.enclosure[0] : item.enclosure;
    const audioUrl = enclosure?.['@_url'] || '';
    const mimeType = enclosure?.['@_type'] || '';
    const fileSize = enclosure?.['@_length'] ? parseInt(enclosure['@_length']) : undefined;
    
    // Parse duration
    const duration = this.parseDuration(item['itunes:duration']?.['#text'] || item['itunes:duration']);
    
    // Parse publish date
    const publishedAt = item.pubDate?.['#text'] || item.pubDate;
    
    // Parse episode and season numbers
    const episodeNumber = item['itunes:episode']?.['#text'] || item['itunes:episode'] 
      ? parseInt(item['itunes:episode']['#text'] || item['itunes:episode']) : undefined;
    const seasonNumber = item['itunes:season']?.['#text'] || item['itunes:season']
      ? parseInt(item['itunes:season']['#text'] || item['itunes:season']) : undefined;
    
    // GUID for deduplication
    const guid = item.guid?.['#text'] || item.guid || item.link?.['#text'] || item.link || '';
    
    // Episode artwork
    const artworkUrl = item['itunes:image']?.['@_href'] || item['itunes:image']?.['#text'] || item['itunes:image'];
    
    return {
      title,
      description,
      audioUrl,
      duration,
      publishedAt,
      episodeNumber,
      seasonNumber,
      guid: typeof guid === 'string' ? guid : '',
      artworkUrl,
      fileSize,
      mimeType,
    };
  }

  /**
   * Parse Atom entry
   */
  private static parseAtomEntry(entry: any): ParsedRssEpisode {
    const title = entry.title?.['#text'] || entry.title || '';
    const description = entry.summary?.['#text'] || entry.summary || entry.content?.['#text'] || '';
    
    // Extract link with rel="enclosure" or type audio
    let audioUrl = '';
    let mimeType = '';
    let fileSize: number | undefined;
    
    const links = Array.isArray(entry.link) ? entry.link : [entry.link];
    const audioLink = links.find((link: any) => 
      link['@_rel'] === 'enclosure' || 
      (link['@_type'] && link['@_type'].startsWith('audio/'))
    );
    
    if (audioLink) {
      audioUrl = audioLink['@_href'];
      mimeType = audioLink['@_type'];
      fileSize = audioLink['@_length'] ? parseInt(audioLink['@_length']) : undefined;
    }
    
    // Parse published date
    const publishedAt = entry.published?.['#text'] || entry.published || entry.updated?.['#text'] || entry.updated;
    
    // GUID is typically the id
    const guid = entry.id?.['#text'] || entry.id || '';
    
    return {
      title,
      description,
      audioUrl,
      publishedAt,
      guid: typeof guid === 'string' ? guid : '',
      fileSize,
      mimeType,
    };
  }

  /**
   * Extract URL from various link formats
   */
  private static extractUrl(link: any): string {
    if (!link) return '';
    if (typeof link === 'string') return link;
    if (link['@_href']) return link['@_href'];
    if (link['#text']) return link['#text'];
    return '';
  }

  /**
   * Extract Atom link
   */
  private static extractAtomLink(link: any): string {
    if (!link) return '';
    const links = Array.isArray(link) ? link : [link];
    const alternateLink = links.find((l: any) => l['@_rel'] === 'alternate' || !l['@_rel']);
    return alternateLink?.['@_href'] || '';
  }

  /**
   * Extract artwork from various sources
   */
  private static extractArtwork(channel: any): string | undefined {
    // Try iTunes image first
    const itunesImage = channel['itunes:image']?.['@_href'] || channel['itunes:image']?.['#text'] || channel['itunes:image'];
    if (itunesImage) return typeof itunesImage === 'string' ? itunesImage : undefined;
    
    // Try image tag
    const image = channel.image;
    if (image) {
      const url = image.url?.['#text'] || image.url;
      if (url) return typeof url === 'string' ? url : undefined;
    }
    
    return undefined;
  }

  /**
   * Extract categories
   */
  private static extractCategories(channel: any): string[] {
    const categories: string[] = [];
    
    // Parse iTunes categories
    const itunesCategories = channel['itunes:category'];
    if (itunesCategories) {
      const cats = Array.isArray(itunesCategories) ? itunesCategories : [itunesCategories];
      for (const cat of cats) {
        const category = cat['@_text'] || cat['#text'] || cat;
        if (category) categories.push(typeof category === 'string' ? category : '');
      }
    }
    
    // Parse regular categories
    const regularCategories = channel.category;
    if (regularCategories) {
      const cats = Array.isArray(regularCategories) ? regularCategories : [regularCategories];
      for (const cat of cats) {
        const category = cat['#text'] || cat['@_text'] || cat;
        if (category) categories.push(typeof category === 'string' ? category : '');
      }
    }
    
    return [...new Set(categories)]; // Remove duplicates
  }

  /**
   * Parse duration string (HH:MM:SS or MM:SS) to seconds
   */
  private static parseDuration(duration: any): number | undefined {
    if (!duration || typeof duration !== 'string') return undefined;
    
    const parts = duration.split(':').map(p => parseInt(p));
    if (parts.length === 3) {
      // HH:MM:SS
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      // MM:SS
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 1) {
      // Just seconds
      return parts[0];
    }
    
    return undefined;
  }

  /**
   * Validate RSS URL
   */
  static isValidRssUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }
}
