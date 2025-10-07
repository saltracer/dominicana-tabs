/**
 * GABC File Mapping Service
 * 
 * Maps chant names to their corresponding GABC files based on notation type preferences.
 * Supports three notation types: dominican, solesmes, and simple.
 */

export type ChantNotationType = 'dominican' | 'solesmes' | 'simple';

export interface GabcFileInfo {
  fileName: string;
  description: string;
  tradition: ChantNotationType;
  complexity: 'full' | 'simple';
  source?: string;
  mode?: number;
}

export interface ChantMapping {
  [notationType: string]: GabcFileInfo;
}

export interface GabcMapping {
  [chantName: string]: ChantMapping;
}

/**
 * Complete mapping of chant names to their GABC files by notation type
 * Based on files available in assets/data/liturgy/compline/chant/gabc/
 */
export const GABC_MAPPING: GabcMapping = {
  'alma-redemptoris-mater': {
    dominican: {
      fileName: '4971-an--alma_redemptoris--dominican.gabc',
      description: 'Alma Redemptoris Mater (Dominican)',
      tradition: 'dominican',
      complexity: 'full',
      source: 'Antiphonarium O.P. (Gillet), 1933, p. 132*',
      mode: 5
    },
    solesmes: {
      fileName: '1851-an--alma_redemptoris_(simple_tone)--solesmes_1961.1.gabc',
      description: 'Alma Redemptoris Mater (Simple Tone - Solesmes)',
      tradition: 'solesmes',
      complexity: 'simple',
      source: 'The Liber Usualis, 1961, p. 277',
      mode: 5
    },
    simple: {
      fileName: '1851-an--alma_redemptoris_(simple_tone)--solesmes_1961.1.gabc',
      description: 'Alma Redemptoris Mater (Simple Tone)',
      tradition: 'solesmes',
      complexity: 'simple',
      source: 'The Liber Usualis, 1961, p. 277',
      mode: 5
    }
  },

  'ave-regina-caelorum': {
    dominican: {
      fileName: '4586-an--ave_regina_caelorum--dominican.gabc',
      description: 'Ave Regina Caelorum (Dominican)',
      tradition: 'dominican',
      complexity: 'full',
      source: 'Antiphonarium O.P. (Gillet), 1933, p. 133*',
      mode: 2
    },
    solesmes: {
      fileName: '12108-an--ave_regina_caelorum--solesmes.gabc',
      description: 'Ave Regina Caelorum (Solesmes)',
      tradition: 'solesmes',
      complexity: 'full',
      source: 'Solesmes',
      mode: 2
    },
    simple: {
      fileName: '12108-an--ave_regina_caelorum--solesmes.gabc',
      description: 'Ave Regina Caelorum (Simple)',
      tradition: 'solesmes',
      complexity: 'simple',
      source: 'Solesmes',
      mode: 2
    }
  },

  'regina-caeli': {
    dominican: {
      fileName: '5320-an--regina_caeli--dominican.gabc',
      description: 'Regina Caeli (Dominican)',
      tradition: 'dominican',
      complexity: 'full',
      source: 'Antiphonarium O.P. (Gillet), 1933, p. 134*',
      mode: 1
    },
    solesmes: {
      fileName: '5320-an--regina_caeli--dominican.gabc',
      description: 'Regina Caeli (Dominican - Solesmes fallback)',
      tradition: 'dominican',
      complexity: 'full',
      source: 'Antiphonarium O.P. (Gillet), 1933, p. 134*',
      mode: 1
    },
    simple: {
      fileName: '15266-an--regina_caeli--simplex.gabc',
      description: 'Regina Caeli (Simplex)',
      tradition: 'simple',
      complexity: 'simple',
      source: 'Simplex',
      mode: 1
    }
  },

  'salve-regina': {
    dominican: {
      fileName: '9961-an--salve_regina--dominican.gabc',
      description: 'Salve Regina (Dominican)',
      tradition: 'dominican',
      complexity: 'full',
      source: 'Antiphonarium O.P. (Gillet), 1933, p. 133',
      mode: 1
    },
    solesmes: {
      fileName: '2435-an--salve_regina_(simple_tone)--solesmes.1.gabc',
      description: 'Salve Regina (Simple Tone - Solesmes)',
      tradition: 'solesmes',
      complexity: 'simple',
      source: 'The Liber Usualis, 1961, p. 279',
      mode: 5
    },
    simple: {
      fileName: '2435-an--salve_regina_(simple_tone)--solesmes.1.gabc',
      description: 'Salve Regina (Simple Tone)',
      tradition: 'solesmes',
      complexity: 'simple',
      source: 'The Liber Usualis, 1961, p. 279',
      mode: 5
    }
  },

  'te-lucis-ante-terminum': {
    dominican: {
      fileName: 'te-lucis.gabc',
      description: 'Te Lucis Ante Terminum',
      tradition: 'dominican',
      complexity: 'simple',
      source: 'Traditional',
      mode: 3
    },
    solesmes: {
      fileName: 'te-lucis.gabc',
      description: 'Te Lucis Ante Terminum (Solesmes)',
      tradition: 'dominican',
      complexity: 'simple',
      source: 'Traditional',
      mode: 3
    },
    simple: {
      fileName: 'te-lucis.gabc',
      description: 'Te Lucis Ante Terminum (Simple)',
      tradition: 'dominican',
      complexity: 'simple',
      source: 'Traditional',
      mode: 3
    }
  }
};

/**
 * Get the GABC file information for a specific chant and notation type
 */
export function getGabcFileInfo(chantName: string, notationType: ChantNotationType): GabcFileInfo | null {
  const chantMapping = GABC_MAPPING[chantName];
  if (!chantMapping) {
    console.warn(`No GABC mapping found for chant: ${chantName}`);
    return null;
  }

  const fileInfo = chantMapping[notationType];
  if (!fileInfo) {
    console.warn(`No GABC file found for chant ${chantName} with notation type ${notationType}`);
    return null;
  }

  return fileInfo;
}

/**
 * Get the GABC file name for a specific chant and notation type
 */
export function getGabcFileName(chantName: string, notationType: ChantNotationType): string | null {
  const fileInfo = getGabcFileInfo(chantName, notationType);
  return fileInfo?.fileName || null;
}

/**
 * Get all available notation types for a specific chant
 */
export function getAvailableNotationTypes(chantName: string): ChantNotationType[] {
  const chantMapping = GABC_MAPPING[chantName];
  if (!chantMapping) {
    return [];
  }

  return Object.keys(chantMapping) as ChantNotationType[];
}

/**
 * Get all available chant names
 */
export function getAvailableChantNames(): string[] {
  return Object.keys(GABC_MAPPING);
}

/**
 * Check if a specific notation type is available for a chant
 */
export function isNotationTypeAvailable(chantName: string, notationType: ChantNotationType): boolean {
  const availableTypes = getAvailableNotationTypes(chantName);
  return availableTypes.includes(notationType);
}

/**
 * Get fallback notation type if the preferred one is not available
 */
export function getFallbackNotationType(chantName: string, preferredType: ChantNotationType): ChantNotationType {
  const availableTypes = getAvailableNotationTypes(chantName);
  
  if (availableTypes.includes(preferredType)) {
    return preferredType;
  }

  // Fallback order: dominican -> solesmes -> simple
  const fallbackOrder: ChantNotationType[] = ['dominican', 'solesmes', 'simple'];
  
  for (const fallbackType of fallbackOrder) {
    if (availableTypes.includes(fallbackType)) {
      return fallbackType;
    }
  }

  // If nothing is available, return the first available type
  return availableTypes[0] as ChantNotationType || 'dominican';
}

/**
 * Map user preference notation string to internal notation type
 */
export function mapUserPreferenceToNotationType(userPreference: string): ChantNotationType {
  switch (userPreference.toLowerCase()) {
    case 'dominican':
      return 'dominican';
    case 'solesmes':
      return 'solesmes';
    case 'simple':
      return 'simple';
    case 'gregorian': // Legacy support
      return 'dominican';
    case 'modern': // Legacy support
      return 'dominican';
    default:
      return 'dominican';
  }
}
