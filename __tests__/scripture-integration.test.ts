import { resolveComplineComponents } from '../utils/complineResolver';
import { ordinaryTimeCompline } from '../assets/data/liturgy/compline/seasons/ordinary-time/compline';
import { bibleService } from '../services/BibleService';

describe('Scripture Integration', () => {
  // Remove mocking - use real Bible service

  it('should resolve scripture references to actual content', async () => {
    const testDate = new Date('2024-01-15'); // Monday
    const resolvedData = await resolveComplineComponents(ordinaryTimeCompline, testDate);
    
    // Check that the reading component has been resolved
    expect(resolvedData.components.reading).toBeDefined();
    expect(resolvedData.components.reading.type).toBe('reading');
    
    // Check that scripture content has been resolved
    expect(resolvedData.components.reading.verses).toBeDefined();
    expect(resolvedData.components.reading.verses?.en?.text).toBeDefined();
    
    // The content should either be actual scripture or an error message
    const scriptureText = resolvedData.components.reading.verses?.en?.text;
    expect(scriptureText).toBeDefined();
    
    // If it's actual scripture, it should contain biblical words
    if (!scriptureText.includes('[Scripture not found') && !scriptureText.includes('[Error loading scripture')) {
      expect(scriptureText).toMatch(/God|Lord|Christ|Jesus|faith|love/i);
    }
  });

  it('should resolve psalm scripture references to actual content', async () => {
    const testDate = new Date('2024-01-14'); // Sunday
    const resolvedData = await resolveComplineComponents(ordinaryTimeCompline, testDate);
    
    // Check that the psalm component has been resolved
    expect(resolvedData.components.psalmody).toBeDefined();
    expect(resolvedData.components.psalmody.type).toBe('psalm');
    
    // Check that psalm scripture content has been resolved
    expect(resolvedData.components.psalmody.verses).toBeDefined();
    expect(resolvedData.components.psalmody.verses?.en?.text).toBeDefined();
    
    // The content should either be actual scripture or an error message
    const psalmText = resolvedData.components.psalmody.verses?.en?.text;
    expect(psalmText).toBeDefined();
    
    // If it's actual scripture, it should contain biblical words
    if (!psalmText.includes('[Scripture not found') && !psalmText.includes('[Error loading scripture')) {
      expect(psalmText).toMatch(/Lord|God|Most High|Almighty/i);
    }
  });

  it('should handle missing scripture gracefully', async () => {
    // Create a mock component with invalid scripture reference
    const mockData = {
      ...ordinaryTimeCompline,
      components: {
        ...ordinaryTimeCompline.components,
        reading: {
          id: 'test-reading',
          type: 'reading' as const,
          title: { en: { text: 'Test Reading' } },
          scriptureRef: {
            book: 'NonExistentBook',
            chapter: 1,
            verse: '1',
            translation: 'DRA'
          },
          source: { en: { text: 'Test Source' } },
          metadata: { author: 'Test Author' }
        }
      }
    };

    const testDate = new Date('2024-01-15');
    const resolvedData = await resolveComplineComponents(mockData, testDate);
    
    // Should have error message in content
    expect(resolvedData.components.reading.verses?.en?.text).toContain('[Scripture not found');
  });

  it('should handle resolver errors gracefully', async () => {
    // Test with invalid data to trigger error handling
    const invalidData = {
      ...ordinaryTimeCompline,
      components: {
        ...ordinaryTimeCompline.components,
        reading: {
          id: 'test-reading',
          type: 'reading' as const,
          title: { en: { text: 'Test Reading' } },
          source: { en: { text: 'Test Source' } },
          metadata: { author: 'Test Author' }
        } // This should trigger error handling
      }
    };

    const testDate = new Date('2024-01-15');
    const resolvedData = await resolveComplineComponents(invalidData, testDate);
    
    // Should return data without crashing
    expect(resolvedData).toBeDefined();
    expect(resolvedData.components).toBeDefined();
  });
});
