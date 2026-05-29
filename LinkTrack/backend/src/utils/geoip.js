// Resolves a client IP to a country code using the geoip-lite offline database.
// Returns null when the IP is local/private (e.g. ::1, 127.0.0.1) or unknown.
const geoip = require('geoip-lite');

function lookupCountry(ip) {
  if (!ip) return null;

  // Strip IPv6 prefix like "::ffff:" so geoip-lite can recognize the IPv4
  const normalized = ip.replace(/^::ffff:/, '');

  // Skip lookups for loopback / private addresses
  if (
    normalized === '127.0.0.1' ||
    normalized === '::1' ||
    normalized.startsWith('10.') ||
    normalized.startsWith('192.168.') ||
    normalized.startsWith('172.')
  ) {
    return null;
  }

  const geo = geoip.lookup(normalized);
  return geo ? geo.country : null;
}

module.exports = lookupCountry;
