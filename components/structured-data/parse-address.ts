/**
 * Parse a "21300 Gordon Way, Unit 188, Richmond, BC V6W 1M2" formatted address.
 * Returns honest empty strings when fewer than 4 comma-space segments are present —
 * no fabricated postal code fallback is emitted.
 */
export function parseAddress(address: string): {
  streetAddress: string; locality: string; region: string; postalCode: string;
} {
  const parts = address.split(', ');
  // Guard: fewer than 4 segments cannot produce a valid Canadian postal address.
  // Return honest empties rather than a hardcoded fallback.
  if (parts.length < 4) {
    return { streetAddress: '', locality: '', region: '', postalCode: '' };
  }
  const streetAddress = parts.slice(0, 2).join(', ');
  const locality = parts[2];
  const regionPostal = parts[3];
  const [region, ...postalParts] = regionPostal.split(' ');
  const postalCode = postalParts.join(' ');
  return { streetAddress, locality, region, postalCode };
}
