import { resolveComplineComponents, resolveComponent } from '../complineResolver';
import { ComplineData, DayOfWeekVariations, DayOfWeek } from '../../types/compline-types';

// Mock data for testing
const createMockHymnComponent = (title: string) => ({
  id: `hymn-${title.toLowerCase().replace(/\s+/g, '-')}`,
  type: 'hymn' as const,
  title: { en: { text: title } },
  content: { en: { text: 'Hymn content' } },
  metadata: { composer: 'Test', century: '21st', meter: '8.8.8.8', tune: 'Test' }
});

const createMockComplineData = (): ComplineData => ({
  id: 'test-id',
  version: '1.0.0',
  lastUpdated: '2024-01-01',
  season: { 
    name: 'Ordinary Time', 
    color: 'green',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    description: 'Test season'
  },
  rank: 'ferial',
  metadata: {
    created: '2024-01-01T00:00:00Z',
    lastModified: '2024-01-01T00:00:00Z',
    version: '1.0.0',
    contributors: ['Test'],
    sources: ['Test Source'],
    notes: 'Test notes'
  },
  components: {
    opening: {
      id: 'opening-test',
      type: 'opening' as const,
      content: { en: { text: 'Opening content' } }
    },
    examinationOfConscience: {
      id: 'examination-test',
      type: 'examination' as const,
      content: { en: { text: 'Examination content' } },
      rubric: { en: { text: 'Examination rubric' } }
    },
    hymn: createMockHymnComponent('Default Hymn'),
    psalmody: {
      id: 'psalm-4',
      type: 'psalm' as const,
      psalmNumber: 4,
      antiphon: { en: { text: 'Default antiphon' } },
      verses: { en: { text: 'Default verses' } },
      metadata: { tone: 'Psalm tone 1', mode: 1 }
    },
    reading: {
      id: 'reading-test',
      type: 'reading' as const,
      title: { en: { text: 'Short Reading' } },
      source: { en: { text: 'Default source' } },
      verses: { en: { text: 'Default reading' } },
      metadata: { author: 'Test Author' }
    },
    responsory: {
      id: 'responsory-test',
      type: 'responsory' as const,
      content: { en: { text: 'Default responsory' } }
    },
    canticle: {
      id: 'canticle-test',
      type: 'canticle' as const,
      name: 'Test Canticle',
      antiphon: { en: { text: 'Default canticle antiphon' } },
      content: { en: { text: 'Default canticle content' } },
      metadata: { biblical_reference: 'Test 1:1', mode: 1 }
    },
    concludingPrayer: {
      id: 'prayer-test',
      type: 'prayer' as const,
      title: { en: { text: 'Concluding Prayer' } },
      content: { en: { text: 'Default prayer' } }
    },
    finalBlessing: {
      id: 'blessing-test',
      type: 'blessing' as const,
      content: { en: { text: 'Default blessing' } }
    }
  }
});

describe('complineResolver', () => {
  describe('resolveComplineComponents', () => {
    it('should return the same data when components are already resolved', async () => {
      const mockData = createMockComplineData();
      const targetDate = new Date('2024-01-15'); // Monday
      
      const result = await resolveComplineComponents(mockData, targetDate);
      
      expect(result.id).toBe(mockData.id);
      expect(result.components.hymn.title.en.text).toBe('Default Hymn');
      expect(result.components.psalmody.psalmNumber).toBe(4);
    });

    it('should preserve all components unchanged when no scripture references', async () => {
      const mockData = createMockComplineData();
      const targetDate = new Date('2024-01-15');
      
      const result = await resolveComplineComponents(mockData, targetDate);
      
      // All components should be preserved
      expect(result.components.opening.content.en.text).toBe('Opening content');
      expect(result.components.examinationOfConscience.content.en.text).toBe('Examination content');
      expect(result.components.finalBlessing.content.en.text).toBe('Default blessing');
      expect(result.components.hymn.title.en.text).toBe('Default Hymn');
    });
  });

  describe('resolveComponent', () => {
    it('should return the component as-is when it is not a DayOfWeekVariations', () => {
      const component = createMockHymnComponent('Test Hymn');
      const targetDate = new Date('2024-01-15');
      
      const result = resolveComponent(component, targetDate);
      
      expect(result).toBe(component);
      expect(result.title.en.text).toBe('Test Hymn');
    });

    it('should resolve DayOfWeekVariations to the correct component', () => {
      const defaultComponent = createMockHymnComponent('Default Hymn');
      const sundayComponent = createMockHymnComponent('Sunday Hymn');
      
      const variations: DayOfWeekVariations<typeof defaultComponent> = {
        type: 'day-of-week-variations',
        default: defaultComponent,
        variations: {
          sunday: sundayComponent
        }
      };
      
      // Test Sunday
      const sundayDate = new Date(2024, 0, 14); // Sunday
      const sundayResult = resolveComponent(variations, sundayDate);
      expect(sundayResult.title.en.text).toBe('Sunday Hymn');
      
      // Test Monday (should get default)
      const mondayDate = new Date(2024, 0, 15); // Monday
      const mondayResult = resolveComponent(variations, mondayDate);
      expect(mondayResult.title.en.text).toBe('Default Hymn');
    });

    it('should handle missing variations by falling back to default', () => {
      const defaultComponent = createMockHymnComponent('Default Hymn');
      
      const variations: DayOfWeekVariations<typeof defaultComponent> = {
        type: 'day-of-week-variations',
        default: defaultComponent,
        variations: {
          sunday: createMockHymnComponent('Sunday Hymn')
          // No variation for Monday
        }
      };
      
      const mondayDate = new Date(2024, 0, 15); // Monday
      const result = resolveComponent(variations, mondayDate);
      
      expect(result.title.en.text).toBe('Default Hymn');
    });
  });
});
