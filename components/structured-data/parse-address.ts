/** Parse address: "21300 Gordon Way, Unit 188, Richmond, BC V6W 1M2" */
export function parseAddress(address: string): {
  streetAddress: string; locality: string; region: string; postalCode: string;
} {
  const parts = address.split(', ');
  const streetAddress = parts.slice(0, 2).join(', ');
  const locality = parts[2] || parts[0];
  const regionPostal = parts[3] || 'BC V6W 1M2';
  const [region, ...postalParts] = regionPostal.split(' ');
  const postalCode = postalParts.join(' ');
  return { streetAddress, locality, region, postalCode };
}
