import AsyncStorage from '@react-native-async-storage/async-storage';

interface Annotation {
  id: string;
  bookId: string;
  chapterId: string;
  position: number;
  text: string;
  type: 'highlight' | 'note' | 'bookmark' | 'underline' | 'strikethrough';
  color: string;
  note?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  userId: string;
}

interface HighlightStyle {
  color: string;
  opacity: number;
  type: 'solid' | 'underline' | 'strikethrough' | 'squiggly';
}

interface AnnotationFilter {
  type?: string;
  color?: string;
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  isPublic?: boolean;
}

interface AnnotationStats {
  totalAnnotations: number;
  byType: Record<string, number>;
  byColor: Record<string, number>;
  byChapter: Record<string, number>;
  recentActivity: Annotation[];
}

class AnnotationService {
  private static readonly ANNOTATIONS_KEY = 'annotations';
  private static readonly HIGHLIGHT_STYLES_KEY = 'highlight_styles';
  private static readonly ANNOTATION_STATS_KEY = 'annotation_stats';

  private defaultHighlightStyles: HighlightStyle[] = [
    { color: '#FFEB3B', opacity: 0.3, type: 'solid' },
    { color: '#4CAF50', opacity: 0.3, type: 'solid' },
    { color: '#2196F3', opacity: 0.3, type: 'solid' },
    { color: '#FF9800', opacity: 0.3, type: 'solid' },
    { color: '#E91E63', opacity: 0.3, type: 'solid' }
  ];

  /**
   * Create a new annotation
   */
  async createAnnotation(annotation: Omit<Annotation, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const newAnnotation: Annotation = {
      ...annotation,
      id: `annotation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const annotations = await this.getAnnotations();
    annotations[newAnnotation.id] = newAnnotation;
    
    await this.saveAnnotations(annotations);
    await this.updateAnnotationStats();

    return newAnnotation.id;
  }

  /**
   * Get annotations for a book
   */
  async getBookAnnotations(bookId: string, filter?: AnnotationFilter): Promise<Annotation[]> {
    const annotations = await this.getAnnotations();
    let bookAnnotations = Object.values(annotations).filter(annotation => annotation.bookId === bookId);

    if (filter) {
      bookAnnotations = this.applyFilter(bookAnnotations, filter);
    }

    return bookAnnotations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Get annotations for a chapter
   */
  async getChapterAnnotations(bookId: string, chapterId: string): Promise<Annotation[]> {
    const annotations = await this.getAnnotations();
    return Object.values(annotations).filter(annotation => 
      annotation.bookId === bookId && annotation.chapterId === chapterId
    );
  }

  /**
   * Update an annotation
   */
  async updateAnnotation(annotationId: string, updates: Partial<Annotation>): Promise<void> {
    const annotations = await this.getAnnotations();
    const annotation = annotations[annotationId];

    if (!annotation) {
      throw new Error('Annotation not found');
    }

    const updatedAnnotation: Annotation = {
      ...annotation,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    annotations[annotationId] = updatedAnnotation;
    await this.saveAnnotations(annotations);
    await this.updateAnnotationStats();
  }

  /**
   * Delete an annotation
   */
  async deleteAnnotation(annotationId: string): Promise<void> {
    const annotations = await this.getAnnotations();
    delete annotations[annotationId];
    
    await this.saveAnnotations(annotations);
    await this.updateAnnotationStats();
  }

  /**
   * Get annotation by ID
   */
  async getAnnotation(annotationId: string): Promise<Annotation | null> {
    const annotations = await this.getAnnotations();
    return annotations[annotationId] || null;
  }

  /**
   * Search annotations
   */
  async searchAnnotations(query: string, bookId?: string): Promise<Annotation[]> {
    const annotations = await this.getAnnotations();
    let searchResults = Object.values(annotations);

    if (bookId) {
      searchResults = searchResults.filter(annotation => annotation.bookId === bookId);
    }

    const searchQuery = query.toLowerCase();
    return searchResults.filter(annotation => 
      annotation.text.toLowerCase().includes(searchQuery) ||
      annotation.note?.toLowerCase().includes(searchQuery) ||
      annotation.tags.some(tag => tag.toLowerCase().includes(searchQuery))
    );
  }

  /**
   * Get annotation statistics
   */
  async getAnnotationStats(bookId?: string): Promise<AnnotationStats> {
    const annotations = await this.getAnnotations();
    let relevantAnnotations = Object.values(annotations);

    if (bookId) {
      relevantAnnotations = relevantAnnotations.filter(annotation => annotation.bookId === bookId);
    }

    const stats: AnnotationStats = {
      totalAnnotations: relevantAnnotations.length,
      byType: {},
      byColor: {},
      byChapter: {},
      recentActivity: relevantAnnotations
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 10)
    };

    // Calculate statistics
    relevantAnnotations.forEach(annotation => {
      // By type
      stats.byType[annotation.type] = (stats.byType[annotation.type] || 0) + 1;
      
      // By color
      stats.byColor[annotation.color] = (stats.byColor[annotation.color] || 0) + 1;
      
      // By chapter
      stats.byChapter[annotation.chapterId] = (stats.byChapter[annotation.chapterId] || 0) + 1;
    });

    return stats;
  }

  /**
   * Get highlight styles
   */
  async getHighlightStyles(): Promise<HighlightStyle[]> {
    try {
      const data = await AsyncStorage.getItem(AnnotationService.HIGHLIGHT_STYLES_KEY);
      return data ? JSON.parse(data) : this.defaultHighlightStyles;
    } catch (error) {
      console.error('Error getting highlight styles:', error);
      return this.defaultHighlightStyles;
    }
  }

  /**
   * Update highlight styles
   */
  async updateHighlightStyles(styles: HighlightStyle[]): Promise<void> {
    await AsyncStorage.setItem(
      AnnotationService.HIGHLIGHT_STYLES_KEY,
      JSON.stringify(styles)
    );
  }

  /**
   * Export annotations
   */
  async exportAnnotations(bookId?: string, format: 'json' | 'csv' | 'markdown' = 'json'): Promise<string> {
    const annotations = bookId 
      ? await this.getBookAnnotations(bookId)
      : Object.values(await this.getAnnotations());

    switch (format) {
      case 'json':
        return JSON.stringify(annotations, null, 2);
      
      case 'csv':
        const csvHeader = 'ID,Book ID,Chapter ID,Type,Text,Note,Color,Tags,Created At\n';
        const csvRows = annotations.map(annotation => 
          `${annotation.id},${annotation.bookId},${annotation.chapterId},${annotation.type},"${annotation.text}","${annotation.note || ''}",${annotation.color},"${annotation.tags.join(',')}",${annotation.createdAt}`
        ).join('\n');
        return csvHeader + csvRows;
      
      case 'markdown':
        let markdown = '# Annotations Export\n\n';
        annotations.forEach(annotation => {
          markdown += `## ${annotation.type.toUpperCase()}\n\n`;
          markdown += `**Text:** ${annotation.text}\n\n`;
          if (annotation.note) {
            markdown += `**Note:** ${annotation.note}\n\n`;
          }
          markdown += `**Tags:** ${annotation.tags.join(', ')}\n\n`;
          markdown += `**Created:** ${new Date(annotation.createdAt).toLocaleDateString()}\n\n---\n\n`;
        });
        return markdown;
      
      default:
        throw new Error('Unsupported export format');
    }
  }

  /**
   * Import annotations
   */
  async importAnnotations(annotations: Annotation[]): Promise<{
    imported: number;
    skipped: number;
    errors: string[];
  }> {
    const result = {
      imported: 0,
      skipped: 0,
      errors: []
    };

    const existingAnnotations = await this.getAnnotations();

    for (const annotation of annotations) {
      try {
        // Check if annotation already exists
        if (existingAnnotations[annotation.id]) {
          result.skipped++;
          continue;
        }

        // Validate annotation
        if (!annotation.id || !annotation.bookId || !annotation.text) {
          result.errors.push(`Invalid annotation: ${annotation.id}`);
          continue;
        }

        // Add annotation
        existingAnnotations[annotation.id] = annotation;
        result.imported++;
      } catch (error) {
        result.errors.push(`Error importing annotation ${annotation.id}: ${error}`);
      }
    }

    if (result.imported > 0) {
      await this.saveAnnotations(existingAnnotations);
      await this.updateAnnotationStats();
    }

    return result;
  }

  /**
   * Get annotations by tags
   */
  async getAnnotationsByTags(tags: string[], bookId?: string): Promise<Annotation[]> {
    const annotations = await this.getAnnotations();
    let filteredAnnotations = Object.values(annotations);

    if (bookId) {
      filteredAnnotations = filteredAnnotations.filter(annotation => annotation.bookId === bookId);
    }

    return filteredAnnotations.filter(annotation => 
      tags.some(tag => annotation.tags.includes(tag))
    );
  }

  /**
   * Get public annotations
   */
  async getPublicAnnotations(bookId?: string): Promise<Annotation[]> {
    const filter: AnnotationFilter = { isPublic: true };
    return bookId 
      ? await this.getBookAnnotations(bookId, filter)
      : Object.values(await this.getAnnotations()).filter(annotation => annotation.isPublic);
  }

  /**
   * Share annotation
   */
  async shareAnnotation(annotationId: string): Promise<string> {
    const annotation = await this.getAnnotation(annotationId);
    if (!annotation) {
      throw new Error('Annotation not found');
    }

    // Make annotation public
    await this.updateAnnotation(annotationId, { isPublic: true });
    
    // In a real implementation, this would generate a shareable link
    return `https://app.example.com/annotation/${annotationId}`;
  }

  /**
   * Get all annotations
   */
  private async getAnnotations(): Promise<Record<string, Annotation>> {
    try {
      const data = await AsyncStorage.getItem(AnnotationService.ANNOTATIONS_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting annotations:', error);
      return {};
    }
  }

  /**
   * Save annotations
   */
  private async saveAnnotations(annotations: Record<string, Annotation>): Promise<void> {
    await AsyncStorage.setItem(
      AnnotationService.ANNOTATIONS_KEY,
      JSON.stringify(annotations)
    );
  }

  /**
   * Apply filter to annotations
   */
  private applyFilter(annotations: Annotation[], filter: AnnotationFilter): Annotation[] {
    return annotations.filter(annotation => {
      if (filter.type && annotation.type !== filter.type) return false;
      if (filter.color && annotation.color !== filter.color) return false;
      if (filter.tags && !filter.tags.some(tag => annotation.tags.includes(tag))) return false;
      if (filter.isPublic !== undefined && annotation.isPublic !== filter.isPublic) return false;
      
      if (filter.dateRange) {
        const annotationDate = new Date(annotation.createdAt);
        const startDate = new Date(filter.dateRange.start);
        const endDate = new Date(filter.dateRange.end);
        
        if (annotationDate < startDate || annotationDate > endDate) return false;
      }
      
      return true;
    });
  }

  /**
   * Update annotation statistics
   */
  private async updateAnnotationStats(): Promise<void> {
    const stats = await this.getAnnotationStats();
    await AsyncStorage.setItem(
      AnnotationService.ANNOTATION_STATS_KEY,
      JSON.stringify(stats)
    );
  }

  /**
   * Clear all annotations
   */
  async clearAllAnnotations(): Promise<void> {
    await AsyncStorage.removeItem(AnnotationService.ANNOTATIONS_KEY);
    await AsyncStorage.removeItem(AnnotationService.ANNOTATION_STATS_KEY);
  }
}

export default new AnnotationService();