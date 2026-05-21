export interface CPMInputs {
  niche: string;
  audienceGeo: string;
  integrationType: string;
}

export interface CPMResult {
  cpm: number;
  baseNicheCpm: number;
  geoMultiplier: number;
  integrationMultiplier: number;
}

/**
 * Calculates a dynamic base CPM in INR based on Niche, Audience Geo, and Integration Type.
 * @param niche Niche of the creator
 * @param audienceGeo Primary audience geography
 * @param integrationType Video integration style
 */
export function cpmCalculator(niche: string, audienceGeo: string, integrationType: string): CPMResult {
  const n = niche.toLowerCase();
  const geo = audienceGeo.toLowerCase();
  const type = integrationType.toLowerCase();

  // 1. Base Niche CPM (in INR)
  let baseNicheCpm = 100;
  if (n.includes('tech')) {
    baseNicheCpm = 300;
  } else if (n.includes('finance') || n.includes('crypto')) {
    baseNicheCpm = 450;
  } else if (n.includes('gaming')) {
    baseNicheCpm = 100;
  } else if (n.includes('vlog') || n.includes('lifestyle')) {
    baseNicheCpm = 150;
  } else if (n.includes('beauty') || n.includes('fashion')) {
    baseNicheCpm = 250;
  }

  // 2. Audience Geo Multiplier
  let geoMultiplier = 1.0;
  if (geo.includes('tier 1') || geo.includes('us') || geo.includes('uk')) {
    geoMultiplier = 3.0;
  } else if (geo.includes('tier 2') || geo.includes('eu') || geo.includes('aus')) {
    geoMultiplier = 1.8;
  } else if (geo.includes('tier 3') || geo.includes('india') || geo.includes('asia')) {
    geoMultiplier = 1.0;
  }

  // 3. Integration Type Multiplier
  let integrationMultiplier = 1.0;
  if (type.includes('dedicated')) {
    integrationMultiplier = 2.5;
  } else if (type.includes('60-sec') || type.includes('shoutout')) {
    integrationMultiplier = 1.0;
  }

  const cpm = Math.round(baseNicheCpm * geoMultiplier * integrationMultiplier);

  return {
    cpm,
    baseNicheCpm,
    geoMultiplier,
    integrationMultiplier
  };
}
