/** Parse address: "21300 Gordon Way, Unit 188, Richmond, BC V6W 1M2"
 *  Returns empty strings for any missing segments — never fabricate data.
 *  A 4-segment comma-separated address is required for a valid PostalAddress.
 */
export function parseAddress(address: string): {
  streetAddress: string; locality: string; region: string; postalCode: string;
} {
  const parts = address.split(',').map(p => p.trim());
  // A real address needs all 4 parts: street, locality, region, postal
  // Less than 4 means degraded data — return empty strings, not fabricated values.
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
