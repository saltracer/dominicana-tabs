import { ChantResource, ChantNotation } from '@/types/compline-types';

// Define chant types available for Marian hymns
export type ChantType = 'dominican' | 'solesmes' | 'simple';

// Interface for GABC file metadata
export interface GabcFileMetadata {
  id: string;
  filename: string;
  name: string;
  officePart: string;
  mode: number;
  book: string;
  transcriber: string;
  chantType: ChantType;
  marianHymnId: string;
}

// GABC file mapping for Marian hymns
export const gabcFileMapping: Record<string, Record<ChantType, GabcFileMetadata>> = {
  'alma-redemptoris-mater': {
    dominican: {
      id: '4971-alma-redemptoris-dominican',
      filename: '4971-an--alma_redemptoris--dominican.gabc',
      name: 'Alma Redemptoris',
      officePart: 'Antiphona',
      mode: 5,
      book: 'Antiphonarium O.P. (Gillet), 1933, p. 132*',
      transcriber: 'Andrew Hinkley',
      chantType: 'dominican',
      marianHymnId: 'alma-redemptoris-mater'
    },
    solesmes: {
      id: '1851-alma-redemptoris-solesmes',
      filename: '1851-an--alma_redemptoris_(simple_tone)--solesmes_1961.1.gabc',
      name: 'Alma Redemptoris (simple tone)',
      officePart: 'Antiphona',
      mode: 5,
      book: 'The Liber Usualis, 1961, p. 277 & Chants of the Church, 1956, p. 83 & Liber antiphonarius, 1960, p. 69',
      transcriber: 'Andrew Hinkley',
      chantType: 'solesmes',
      marianHymnId: 'alma-redemptoris-mater'
    },
    simple: {
      id: '1851-alma-redemptoris-simple',
      filename: '1851-an--alma_redemptoris_(simple_tone)--solesmes_1961.1.gabc',
      name: 'Alma Redemptoris (simple tone)',
      officePart: 'Antiphona',
      mode: 5,
      book: 'The Liber Usualis, 1961, p. 277 & Chants of the Church, 1956, p. 83 & Liber antiphonarius, 1960, p. 69',
      transcriber: 'Andrew Hinkley',
      chantType: 'simple',
      marianHymnId: 'alma-redemptoris-mater'
    }
  },
  'ave-regina-caelorum': {
    dominican: {
      id: '4586-ave-regina-caelorum-dominican',
      filename: '4586-an--ave_regina_caelorum--dominican.gabc',
      name: 'Ave Regina Caelorum',
      officePart: 'Antiphona',
      mode: 6,
      book: 'Processionarium O.P. (Cormier), 1913, p. 88',
      transcriber: 'Andrew Hinkley',
      chantType: 'dominican',
      marianHymnId: 'ave-regina-caelorum'
    },
    solesmes: {
      id: '12108-ave-regina-caelorum-solesmes',
      filename: '12108-an--ave_regina_caelorum--solesmes.gabc',
      name: 'Ave Regina Caelorum',
      officePart: 'Antiphona',
      mode: 6,
      book: 'Liber antiphonarius, 1960, p. 69',
      transcriber: 'Andrew Hinkley',
      chantType: 'solesmes',
      marianHymnId: 'ave-regina-caelorum'
    },
    simple: {
      id: '12108-ave-regina-caelorum-simple',
      filename: '12108-an--ave_regina_caelorum--solesmes.gabc',
      name: 'Ave Regina Caelorum',
      officePart: 'Antiphona',
      mode: 6,
      book: 'Liber antiphonarius, 1960, p. 69',
      transcriber: 'Andrew Hinkley',
      chantType: 'simple',
      marianHymnId: 'ave-regina-caelorum'
    }
  },
  'regina-caeli': {
    dominican: {
      id: '5320-regina-caeli-dominican',
      filename: '5320-an--regina_caeli--dominican.gabc',
      name: 'Regina Caeli',
      officePart: 'Antiphona',
      mode: 6,
      book: 'Processionarium O.P. (Cormier), 1913, p. 88',
      transcriber: 'Andrew Hinkley',
      chantType: 'dominican',
      marianHymnId: 'regina-caeli'
    },
    solesmes: {
      id: '15266-regina-caeli-solesmes',
      filename: '15266-an--regina_caeli--simplex.gabc',
      name: 'Regina Caeli',
      officePart: 'Antiphona',
      mode: 6,
      book: 'Liber antiphonarius, 1960, p. 69',
      transcriber: 'Andrew Hinkley',
      chantType: 'solesmes',
      marianHymnId: 'regina-caeli'
    },
    simple: {
      id: '15266-regina-caeli-simple',
      filename: '15266-an--regina_caeli--simplex.gabc',
      name: 'Regina Caeli',
      officePart: 'Antiphona',
      mode: 6,
      book: 'Liber antiphonarius, 1960, p. 69',
      transcriber: 'Andrew Hinkley',
      chantType: 'simple',
      marianHymnId: 'regina-caeli'
    }
  },
  'salve-regina': {
    dominican: {
      id: '9961-salve-regina-dominican',
      filename: '9961-an--salve_regina--dominican.gabc',
      name: 'Salve Regina',
      officePart: 'Antiphona',
      mode: 1,
      book: 'Processionarium O.P. (Cormier), 1913, p. 88',
      transcriber: 'Andrew Hinkley',
      chantType: 'dominican',
      marianHymnId: 'salve-regina'
    },
    solesmes: {
      id: '2435-salve-regina-solesmes',
      filename: '2435-an--salve_regina_(simple_tone)--solesmes.1.gabc',
      name: 'Salve Regina (simple tone)',
      officePart: 'Antiphona',
      mode: 1,
      book: 'The Liber Usualis, 1961, p. 277 & Chants of the Church, 1956, p. 83 & Liber antiphonarius, 1960, p. 69',
      transcriber: 'Andrew Hinkley',
      chantType: 'solesmes',
      marianHymnId: 'salve-regina'
    },
    simple: {
      id: '8127-salve-regina-simple',
      filename: '8127-an--salve_regina_(simple_tone_with_english_translation)--solesmes.gabc',
      name: 'Salve Regina (simple tone with English translation)',
      officePart: 'Antiphona',
      mode: 1,
      book: 'Liber antiphonarius, 1960, p. 69',
      transcriber: 'Andrew Hinkley',
      chantType: 'simple',
      marianHymnId: 'salve-regina'
    }
  }
};

/**
 * Get available chant types for a Marian hymn
 */
export function getAvailableChantTypes(marianHymnId: string): ChantType[] {
  const hymnMapping = gabcFileMapping[marianHymnId];
  if (!hymnMapping) return [];
  return Object.keys(hymnMapping) as ChantType[];
}

/**
 * Get GABC file metadata for a specific Marian hymn and chant type
 */
export function getGabcMetadata(marianHymnId: string, chantType: ChantType): GabcFileMetadata | null {
  const hymnMapping = gabcFileMapping[marianHymnId];
  if (!hymnMapping) return null;
  return hymnMapping[chantType] || null;
}

/**
 * Get the default chant type for a Marian hymn (prefer Dominican for Dominican app)
 */
export function getDefaultChantType(marianHymnId: string): ChantType {
  const availableTypes = getAvailableChantTypes(marianHymnId);
  // Prefer Dominican, then Solesmes, then Simple
  if (availableTypes.includes('dominican')) return 'dominican';
  if (availableTypes.includes('solesmes')) return 'solesmes';
  if (availableTypes.includes('simple')) return 'simple';
  return availableTypes[0] || 'solesmes';
}

/**
 * Get chant type display name
 */
export function getChantTypeDisplayName(chantType: ChantType): string {
  switch (chantType) {
    case 'dominican':
      return 'Dominican Chant';
    case 'solesmes':
      return 'Solesmes Chant';
    case 'simple':
      return 'Simple Tone';
    default:
      return 'Unknown';
  }
}

/**
 * Get chant type description
 */
export function getChantTypeDescription(chantType: ChantType): string {
  switch (chantType) {
    case 'dominican':
      return 'Traditional Dominican chant from the Order\'s own books';
    case 'solesmes':
      return 'Solesmes method chant from the Liber Usualis';
    case 'simple':
      return 'Simplified chant suitable for congregational singing';
    default:
      return '';
  }
}
