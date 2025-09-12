import { Province } from '../types';

export interface ProcessedPolygon {
  id: string;
  coordinates: number[][];
  regionColor: string;
  isSelected: boolean;
  province: Province;
}

/**
 * Processes province boundaries and extracts polygon data for rendering
 * Handles both GeoJSON Feature format and direct geometry formats
 */
export function processProvinceBoundaries(
  province: Province,
  getProvinceColor: (province: Province) => string,
  selectedProvinceId?: string
): ProcessedPolygon[] | null {
  try {
    // Check if boundaries exist
    if (!province.boundaries) {
      return null;
    }

    const boundaries = province.boundaries;
    const regionColor = getProvinceColor(province);
    const isSelected = selectedProvinceId === province.id;

    // Helper function to create polygon data from coordinates
    const createPolygonData = (coordinates: number[][], polygonIndex?: number): ProcessedPolygon => {
      const id = polygonIndex !== undefined 
        ? `polygon-${province.id}-${polygonIndex}` 
        : `polygon-${province.id}`;

      return {
        id,
        coordinates,
        regionColor,
        isSelected,
        province,
      };
    };

    // Handle GeoJSON Feature format (e.g., Switzerland)
    if (boundaries.type === 'Feature' && boundaries.geometry) {
      const geometry = boundaries.geometry;
      const geometryType = geometry.type;
      const coordinates = geometry.coordinates;

      // Handle MultiPolygon within Feature
      if (geometryType === 'MultiPolygon' && Array.isArray(coordinates)) {
        const polygons: ProcessedPolygon[] = [];
        
        coordinates.forEach((polygon: any, polygonIndex: number) => {
          if (!Array.isArray(polygon) || polygon.length === 0) {
            return;
          }

          const ring = polygon[0];
          if (!Array.isArray(ring) || ring.length < 3) {
            return;
          }

          polygons.push(createPolygonData(ring, polygonIndex));
        });

        return polygons.length > 0 ? polygons : null;
      }

      // Handle single Polygon within Feature
      if (geometryType === 'Polygon' && Array.isArray(coordinates)) {
        const ring = coordinates[0];
        if (!Array.isArray(ring) || ring.length < 3) {
          return null;
        }

        return [createPolygonData(ring)];
      }
    }

    // Handle direct MultiPolygon structure (backward compatibility)
    if (boundaries.type === 'MultiPolygon' && Array.isArray(boundaries.coordinates)) {
      const polygons: ProcessedPolygon[] = [];
      
      boundaries.coordinates.forEach((polygon: any, polygonIndex: number) => {
        if (!Array.isArray(polygon) || polygon.length === 0) {
          return;
        }

        const ring = polygon[0];
        if (!Array.isArray(ring) || ring.length < 3) {
          return;
        }

        polygons.push(createPolygonData(ring, polygonIndex));
      });

      return polygons.length > 0 ? polygons : null;
    }

    // Handle direct single Polygon structure (backward compatibility)
    if (boundaries.type === 'Polygon' && Array.isArray(boundaries.coordinates)) {
      const ring = boundaries.coordinates[0];
      if (!Array.isArray(ring) || ring.length < 3) {
        return null;
      }

      return [createPolygonData(ring)];
    }

    return null;
  } catch (error) {
    console.warn(`Error processing boundaries for province ${province.id}:`, error);
    return null;
  }
}

/**
 * Processes all provinces and returns flattened array of polygon data
 */
export function processAllProvinceBoundaries(
  provinces: Province[],
  getProvinceColor: (province: Province) => string,
  selectedProvinceId?: string
): ProcessedPolygon[] {
  const allPolygons: ProcessedPolygon[] = [];

  provinces.forEach(province => {
    const polygons = processProvinceBoundaries(province, getProvinceColor, selectedProvinceId);
    if (polygons) {
      allPolygons.push(...polygons);
    }
  });

  return allPolygons;
}
