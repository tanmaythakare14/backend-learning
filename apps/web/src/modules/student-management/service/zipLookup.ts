import type { ZipLookupResult } from '../@types';

interface ZippopotamPlace {
  'place name': string;
  state: string;
  'state abbreviation': string;
}

interface ZippopotamResponse {
  places: ZippopotamPlace[];
}

function isZippopotamResponse(value: unknown): value is ZippopotamResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    Array.isArray((value as { places?: unknown }).places)
  );
}

/**
 * Free public postal-code lookup (zippopotam.us, no key required). Best-effort
 * only — a failed request or an unrecognized code just resolves to null, and
 * the caller leaves the state/city Comboboxes for the admin to fill manually.
 */
export async function lookupZipCode(
  countryIsoCode: string,
  zipCode: string,
): Promise<ZipLookupResult | null> {
  try {
    const res = await fetch(
      `https://api.zippopotam.us/${countryIsoCode.toLowerCase()}/${encodeURIComponent(zipCode)}`,
    );
    if (!res.ok) return null;

    const body: unknown = await res.json();
    if (!isZippopotamResponse(body) || body.places.length === 0) return null;

    const place = body.places[0];
    return {
      stateName: place.state,
      stateAbbreviation: place['state abbreviation'],
      city: place['place name'],
    };
  } catch {
    return null;
  }
}
