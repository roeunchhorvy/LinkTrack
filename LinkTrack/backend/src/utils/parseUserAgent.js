// Parses a raw User-Agent string into browser + device labels using ua-parser-js.
const UAParser = require('ua-parser-js');

function parseUserAgent(uaString) {
  if (!uaString) return { browser: 'Unknown', device: 'Unknown' };

  const parser = new UAParser(uaString);
  const browser = parser.getBrowser();
  const device = parser.getDevice();
  const os = parser.getOS();

  // device.type is undefined for desktop, so fall back to OS name for clarity
  const deviceLabel =
    device.type ||
    (os.name ? `Desktop (${os.name})` : 'Desktop');

  return {
    browser: browser.name ? `${browser.name} ${browser.version || ''}`.trim() : 'Unknown',
    device: deviceLabel,
  };
}

module.exports = parseUserAgent;
