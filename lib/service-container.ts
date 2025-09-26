/**
 * Service container for dependency injection
 */

import { BookRepository } from '../repositories/book-repository';
import { ComplineService } from '../services/ComplineService';
import { OfflineManager } from '../services/OfflineManager';
import { LiturgicalCalendarService } from '../services/LiturgicalCalendar';
import { BibleService } from '../services/BibleService';
import { MultiVersionBibleService } from '../services/MultiVersionBibleService';
import { UserLiturgyPreferencesService } from '../services/UserLiturgyPreferencesService';

export interface ServiceContainer {
  // Repositories
  bookRepository: BookRepository;
  
  // Services
  complineService: ComplineService;
  offlineManager: OfflineManager;
  liturgicalCalendarService: LiturgicalCalendarService;
  bibleService: BibleService;
  multiVersionBibleService: MultiVersionBibleService;
  userLiturgyPreferencesService: UserLiturgyPreferencesService;
}

class ServiceContainerImpl implements ServiceContainer {
  // Repositories
  public readonly bookRepository: BookRepository;
  
  // Services
  public readonly complineService: ComplineService;
  public readonly offlineManager: OfflineManager;
  public readonly liturgicalCalendarService: LiturgicalCalendarService;
  public readonly bibleService: BibleService;
  public readonly multiVersionBibleService: MultiVersionBibleService;
  public readonly userLiturgyPreferencesService: UserLiturgyPreferencesService;

  constructor() {
    // Initialize repositories
    this.bookRepository = new BookRepository();
    
    // Initialize services
    this.complineService = ComplineService.getInstance();
    this.offlineManager = OfflineManager.getInstance();
    this.liturgicalCalendarService = LiturgicalCalendarService.getInstance();
    this.bibleService = new BibleService();
    this.multiVersionBibleService = new MultiVersionBibleService();
    this.userLiturgyPreferencesService = new UserLiturgyPreferencesService();
  }
}

// Global service container instance
export const serviceContainer = new ServiceContainerImpl();

// Export individual services for convenience
export const {
  bookRepository,
  complineService,
  offlineManager,
  liturgicalCalendarService,
  bibleService,
  multiVersionBibleService,
  userLiturgyPreferencesService,
} = serviceContainer;
