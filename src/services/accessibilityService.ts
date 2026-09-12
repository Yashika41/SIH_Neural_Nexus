import { LatLng, AccessibilityFeature } from '../types';
import { calculateHaversineDistance } from './aiServices';

export interface AccessibilityAssessment {
  accessibilityScore: number; // 0 - 100
  accessibilityPenalty: number; // 0 - 100
  warnings: string[];
  benefits: string[];
}

/**
 * Validates requirements against route features and destination location.
 */
export function validateAccessibility(
  routeFeatures: AccessibilityFeature[],
  requirements: string[],
  destinationCoords?: LatLng
): AccessibilityAssessment {
  let score = 85; // Base score
  let penalty = 0;
  const warnings: string[] = [];
  const benefits: string[] = [];

  const reqSet = new Set(requirements);

  // Check for stairs
  const hasStairs = routeFeatures.some((f) => f.type === 'stairs');
  if (hasStairs) {
    if (reqSet.has('Avoid Stairs') || reqSet.has('Wheelchair Accessible')) {
      penalty += 45;
      score -= 40;
      warnings.push('Contains stairs incompatible with wheelchair/stroller profiles');
    } else {
      penalty += 15;
      score -= 10;
    }
  }

  // Check steep slopes
  const hasSteep = routeFeatures.some((f) => f.type === 'steep slope');
  if (hasSteep) {
    if (reqSet.has('Avoid Very Steep Sections') || reqSet.has('Wheelchair Accessible')) {
      penalty += 35;
      score -= 30;
      warnings.push('Includes steep incline sections (>10%)');
    } else {
      penalty += 15;
      score -= 10;
    }
  }

  // Check poor surface
  const hasPoorSurface = routeFeatures.some((f) => f.type === 'poor surface');
  if (hasPoorSurface) {
    if (reqSet.has('Avoid Poor Surface') || reqSet.has('Low-Floor Vehicle Required')) {
      penalty += 30;
      score -= 25;
      warnings.push('Passes through sections with damaged/poor asphalt');
    } else {
      penalty += 10;
      score -= 10;
    }
  }

  // Check ramps & wheelchair accessible features
  const hasRamps = routeFeatures.some((f) => f.type === 'ramp' || f.type === 'wheelchair accessible');
  if (hasRamps) {
    score += 15;
    benefits.push('Verified wheelchair accessible ramps available');
  }

  if (reqSet.has('Wheelchair Accessible') && score >= 80) {
    benefits.push('Fully compliant with wheelchair accessibility requirements');
  }

  const finalScore = Math.min(100, Math.max(10, score));
  const finalPenalty = Math.min(100, Math.max(0, penalty));

  return {
    accessibilityScore: finalScore,
    accessibilityPenalty: finalPenalty,
    warnings,
    benefits
  };
}
