import { resolveComplineComponents, resolveComponent } from '../complineResolver';
import { ComplineData, DayOfWeekVariations, DayOfWeek } from '../../types/compline-types';

// Mock data for testing
const createMockHymnComponent = (title: string) => ({
  title: { en: { text: title } },
  content: { en: { text: 'Hymn content' } }
});

const createMockComplineData = (): ComplineData => ({
  id: 'test-id',
  version: '1.0.0',
  lastUpdated: '2024-01-01',
  season: { name: 'Ordinary Time', color: 'green' },
  rank: 'ferial',
  metadata: {
    title: { en: { text: 'Test Compline' } },
    description: { en: { text: 'Test description' } }
  },
  components: {
    opening: {
      content: { en: { text: 'Opening content' } }
    },
    examinationOfConscience: {
      content: { en: { text: 'Examination content' } },
      rubric: { en: { text: 'Examination rubric' } }
    },
    hymn: createMockHymnComponent('Default Hymn'),
    psalmody: {
      psalmNumber: '4',
      antiphon: { en: { text: 'Default antiphon' } },
      verses: { en: { text: 'Default verses' } }
    },
    reading: {
      source: { en: { text: 'Default source' } },
      content: { en: { text: 'Default reading' } }
    },
    responsory: {
      content: { en: { text: 'Default responsory' } }
    },
    canticle: {
      antiphon: { en: { text: 'Default canticle antiphon' } },
      content: { en: { text: 'Default canticle content' } }
    },
    concludingPrayer: {
      content: { en: { text: 'Default prayer' } }
    },
    finalBlessing: {
      content: { en: { text: 'Default blessing' } }
    }
  }
});

describe('complineResolver', () => {
  describe('resolveComplineComponents', () => {
    it('should return the same data when no DayOfWeekVariations are present', () => {
      const mockData = createMockComplineData();
      const targetDate = new Date('2024-01-15'); // Monday
      
      const result = resolveComplineComponents(mockData, targetDate);
      
      expect(result.id).toBe(mockData.id);
      expect(result.components.hymn.title.en.text).toBe('Default Hymn');
      expect(result.components.psalmody.psalmNumber).toBe('4');
    });

    it('should resolve DayOfWeekVariations for hymn component', () => {
      const mockData = createMockComplineData();
      const mondayHymn = createMockHymnComponent('Monday Hymn');
      const sundayHymn = createMockHymnComponent('Sunday Hymn');
      
      // Create DayOfWeekVariations for hymn
      const hymnVariations: DayOfWeekVariations<typeof mondayHymn> = {
        type: 'day-of-week-variations',
        default: mondayHymn,
        variations: {
          sunday: sundayHymn
        }
      };
      
      mockData.components.hymn = hymnVariations;
      
      // Test Sunday (should get Sunday hymn)
      const sundayDate = new Date(2024, 0, 14); // Sunday (getDay() = 0)
      const sundayResult = resolveComplineComponents(mockData, sundayDate);
      expect(sundayResult.components.hymn.title.en.text).toBe('Sunday Hymn');
      
      // Test Monday (should get default hymn)
      const mondayDate = new Date(2024, 0, 15); // Monday
      const mondayResult = resolveComplineComponents(mockData, mondayDate);
      expect(mondayResult.components.hymn.title.en.text).toBe('Monday Hymn');
    });

    it('should resolve multiple DayOfWeekVariations components', () => {
      const mockData = createMockComplineData();
      
      // Create variations for multiple components
      const hymnVariations: DayOfWeekVariations<typeof mockData.components.hymn> = {
        type: 'day-of-week-variations',
        default: mockData.components.hymn,
        variations: {
          sunday: createMockHymnComponent('Sunday Hymn')
        }
      };
      
      const psalmodyVariations: DayOfWeekVariations<typeof mockData.components.psalmody> = {
        type: 'day-of-week-variations',
        default: mockData.components.psalmody,
        variations: {
          sunday: {
            psalmNumber: '23',
            antiphon: { en: { text: 'Sunday antiphon' } },
            verses: { en: { text: 'Sunday verses' } }
          }
        }
      };
      
      mockData.components.hymn = hymnVariations;
      mockData.components.psalmody = psalmodyVariations;
      
      const sundayDate = new Date(2024, 0, 14); // Sunday
      const result = resolveComplineComponents(mockData, sundayDate);
      
      expect(result.components.hymn.title.en.text).toBe('Sunday Hymn');
      expect(result.components.psalmody.psalmNumber).toBe('23');
      expect(result.components.psalmody.antiphon.en.text).toBe('Sunday antiphon');
    });

    it('should preserve non-variation components unchanged', () => {
      const mockData = createMockComplineData();
      const targetDate = new Date('2024-01-15');
      
      const result = resolveComplineComponents(mockData, targetDate);
      
      // These components don't have variations, so they should be unchanged
      expect(result.components.opening.content.en.text).toBe('Opening content');
      expect(result.components.examinationOfConscience.content.en.text).toBe('Examination content');
      expect(result.components.finalBlessing.content.en.text).toBe('Default blessing');
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
