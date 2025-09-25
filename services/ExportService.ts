import AsyncStorage from '@react-native-async-storage/async-storage';
import { Book, Bookmark, ReadingProgress } from '../types';

interface ExportData {
  bookmarks: Bookmark[];
  annotations: any[];
  readingProgress: ReadingProgress[];
  notes: any[];
  readingStats: any;
  exportDate: string;
  version: string;
}

interface ExportOptions {
  format: 'json' | 'csv' | 'pdf' | 'markdown';
  includeBookmarks: boolean;
  includeAnnotations: boolean;
  includeProgress: boolean;
  includeNotes: boolean;
  includeStats: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

class ExportService {
  private static readonly EXPORT_HISTORY_KEY = 'export_history';

  /**
   * Export user data in specified format
   */
  async exportData(options: ExportOptions): Promise<string> {
    const exportData: ExportData = {
      bookmarks: [],
      annotations: [],
      readingProgress: [],
      notes: [],
      readingStats: {},
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };

    // Collect data based on options
    if (options.includeBookmarks) {
      exportData.bookmarks = await this.getAllBookmarks();
    }

    if (options.includeAnnotations) {
      exportData.annotations = await this.getAllAnnotations();
    }

    if (options.includeProgress) {
      exportData.readingProgress = await this.getAllReadingProgress();
    }

    if (options.includeNotes) {
      exportData.notes = await this.getAllNotes();
    }

    if (options.includeStats) {
      exportData.readingStats = await this.getReadingStats();
    }

    // Filter by date range if specified
    if (options.dateRange) {
      exportData.bookmarks = this.filterByDateRange(exportData.bookmarks, options.dateRange);
      exportData.annotations = this.filterByDateRange(exportData.annotations, options.dateRange);
      exportData.notes = this.filterByDateRange(exportData.notes, options.dateRange);
    }

    // Generate export based on format
    switch (options.format) {
      case 'json':
        return this.exportToJSON(exportData);
      case 'csv':
        return this.exportToCSV(exportData);
      case 'pdf':
        return this.exportToPDF(exportData);
      case 'markdown':
        return this.exportToMarkdown(exportData);
      default:
        throw new Error('Unsupported export format');
    }
  }

  /**
   * Export bookmarks to JSON
   */
  async exportBookmarks(bookId?: string): Promise<string> {
    const bookmarks = bookId 
      ? await this.getBookBookmarks(bookId)
      : await this.getAllBookmarks();
    
    return JSON.stringify({
      bookmarks,
      exportDate: new Date().toISOString(),
      totalCount: bookmarks.length
    }, null, 2);
  }

  /**
   * Export annotations to JSON
   */
  async exportAnnotations(bookId?: string): Promise<string> {
    const annotations = bookId 
      ? await this.getBookAnnotations(bookId)
      : await this.getAllAnnotations();
    
    return JSON.stringify({
      annotations,
      exportDate: new Date().toISOString(),
      totalCount: annotations.length
    }, null, 2);
  }

  /**
   * Export reading progress to CSV
   */
  async exportReadingProgress(): Promise<string> {
    const progress = await this.getAllReadingProgress();
    
    const csvHeader = 'Book ID,Current Position,Total Pages,Last Read,Time Spent\n';
    const csvRows = progress.map(p => 
      `${p.bookId},${p.currentPosition},${p.totalPages},${p.lastRead},${p.timeSpent}`
    ).join('\n');
    
    return csvHeader + csvRows;
  }

  /**
   * Export to PDF format
   */
  async exportToPDF(data: ExportData): Promise<string> {
    // In a real implementation, this would generate a PDF
    // For now, return a formatted text representation
    let pdfContent = `# Reading Export Report\n\n`;
    pdfContent += `Generated: ${data.exportDate}\n\n`;
    
    if (data.bookmarks.length > 0) {
      pdfContent += `## Bookmarks (${data.bookmarks.length})\n\n`;
      data.bookmarks.forEach(bookmark => {
        pdfContent += `- **${bookmark.note || 'Bookmark'}** (Position: ${bookmark.position})\n`;
      });
      pdfContent += '\n';
    }
    
    if (data.annotations.length > 0) {
      pdfContent += `## Annotations (${data.annotations.length})\n\n`;
      data.annotations.forEach(annotation => {
        pdfContent += `- ${annotation.text || 'Annotation'}\n`;
      });
      pdfContent += '\n';
    }
    
    if (data.readingProgress.length > 0) {
      pdfContent += `## Reading Progress\n\n`;
      data.readingProgress.forEach(progress => {
        const percentage = (progress.currentPosition / progress.totalPages) * 100;
        pdfContent += `- Book ${progress.bookId}: ${percentage.toFixed(1)}% complete\n`;
      });
    }
    
    return pdfContent;
  }

  /**
   * Export to Markdown format
   */
  async exportToMarkdown(data: ExportData): Promise<string> {
    let markdown = `# Reading Export\n\n`;
    markdown += `**Export Date:** ${new Date(data.exportDate).toLocaleDateString()}\n\n`;
    
    if (data.bookmarks.length > 0) {
      markdown += `## Bookmarks (${data.bookmarks.length})\n\n`;
      data.bookmarks.forEach(bookmark => {
        markdown += `- **${bookmark.note || 'Bookmark'}**\n`;
        markdown += `  - Position: ${bookmark.position}\n`;
        markdown += `  - Created: ${new Date(bookmark.createdAt).toLocaleDateString()}\n\n`;
      });
    }
    
    if (data.annotations.length > 0) {
      markdown += `## Annotations (${data.annotations.length})\n\n`;
      data.annotations.forEach(annotation => {
        markdown += `- ${annotation.text || 'Annotation'}\n`;
        markdown += `  - Chapter: ${annotation.chapter || 'Unknown'}\n`;
        markdown += `  - Created: ${new Date(annotation.createdAt).toLocaleDateString()}\n\n`;
      });
    }
    
    if (data.readingProgress.length > 0) {
      markdown += `## Reading Progress\n\n`;
      data.readingProgress.forEach(progress => {
        const percentage = (progress.currentPosition / progress.totalPages) * 100;
        markdown += `- **Book ${progress.bookId}**\n`;
        markdown += `  - Progress: ${percentage.toFixed(1)}%\n`;
        markdown += `  - Time Spent: ${Math.floor(progress.timeSpent / 60)} minutes\n`;
        markdown += `  - Last Read: ${new Date(progress.lastRead).toLocaleDateString()}\n\n`;
      });
    }
    
    return markdown;
  }

  /**
   * Get export history
   */
  async getExportHistory(): Promise<Array<{
    id: string;
    format: string;
    date: string;
    size: number;
    items: number;
  }>> {
    try {
      const data = await AsyncStorage.getItem(ExportService.EXPORT_HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting export history:', error);
      return [];
    }
  }

  /**
   * Save export to history
   */
  private async saveExportToHistory(exportInfo: {
    format: string;
    size: number;
    items: number;
  }): Promise<void> {
    const history = await this.getExportHistory();
    const newExport = {
      id: `export_${Date.now()}`,
      format: exportInfo.format,
      date: new Date().toISOString(),
      size: exportInfo.size,
      items: exportInfo.items
    };
    
    history.unshift(newExport);
    // Keep only last 10 exports
    const limitedHistory = history.slice(0, 10);
    
    await AsyncStorage.setItem(
      ExportService.EXPORT_HISTORY_KEY,
      JSON.stringify(limitedHistory)
    );
  }

  /**
   * Export to JSON format
   */
  private exportToJSON(data: ExportData): string {
    return JSON.stringify(data, null, 2);
  }

  /**
   * Export to CSV format
   */
  private exportToCSV(data: ExportData): string {
    let csv = 'Type,Content,Date,Position\n';
    
    data.bookmarks.forEach(bookmark => {
      csv += `Bookmark,"${bookmark.note || 'Bookmark'}",${bookmark.createdAt},${bookmark.position}\n`;
    });
    
    data.annotations.forEach(annotation => {
      csv += `Annotation,"${annotation.text || 'Annotation'}",${annotation.createdAt},${annotation.position || 'N/A'}\n`;
    });
    
    return csv;
  }

  /**
   * Get all bookmarks
   */
  private async getAllBookmarks(): Promise<Bookmark[]> {
    // This would get all bookmarks from storage
    return [];
  }

  /**
   * Get bookmarks for a specific book
   */
  private async getBookBookmarks(bookId: string): Promise<Bookmark[]> {
    // This would get bookmarks for a specific book
    return [];
  }

  /**
   * Get all annotations
   */
  private async getAllAnnotations(): Promise<any[]> {
    // This would get all annotations from storage
    return [];
  }

  /**
   * Get annotations for a specific book
   */
  private async getBookAnnotations(bookId: string): Promise<any[]> {
    // This would get annotations for a specific book
    return [];
  }

  /**
   * Get all reading progress
   */
  private async getAllReadingProgress(): Promise<ReadingProgress[]> {
    // This would get all reading progress from storage
    return [];
  }

  /**
   * Get all notes
   */
  private async getAllNotes(): Promise<any[]> {
    // This would get all notes from storage
    return [];
  }

  /**
   * Get reading statistics
   */
  private async getReadingStats(): Promise<any> {
    // This would get reading statistics
    return {};
  }

  /**
   * Filter data by date range
   */
  private filterByDateRange<T extends { createdAt: string }>(
    data: T[], 
    dateRange: { start: string; end: string }
  ): T[] {
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    
    return data.filter(item => {
      const itemDate = new Date(item.createdAt);
      return itemDate >= startDate && itemDate <= endDate;
    });
  }
}

export default new ExportService();