export function isLocalOrLanHost(host) {
  const value = String(host || "").trim().toLowerCase().replace(/\.$/, "");
  const ipv4 = parseIpv4(value);
  const ipv6 = value.replace(/^\[|\]$/g, "").split("%")[0];

  const localIpv4 = Boolean(ipv4) && (
    ipv4[0] === 0
    || ipv4[0] === 10
    || ipv4[0] === 127
    || (ipv4[0] === 100 && ipv4[1] >= 64 && ipv4[1] <= 127)
    || (ipv4[0] === 169 && ipv4[1] === 254)
    || (ipv4[0] === 172 && ipv4[1] >= 16 && ipv4[1] <= 31)
    || (ipv4[0] === 192 && ipv4[1] === 168)
    || ipv4[0] >= 224
  );
  const localIpv6 = ipv6 === "::"
    || ipv6 === "::1"
    || /^(?:fc|fd)[0-9a-f]{2}:/i.test(ipv6)
    || /^fe[89ab][0-9a-f]:/i.test(ipv6);
  const mappedIpv4 = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i.exec(ipv6)?.[1];

  return value === "localhost"
    || value.endsWith(".localhost")
    || value.endsWith(".local")
    || localIpv4
    || localIpv6
    || Boolean(mappedIpv4 && isLocalOrLanHost(mappedIpv4));
}

function parseIpv4(value) {
  const parts = String(value || "").split(".");
  if (parts.length !== 4 || parts.some((part) => !/^\d{1,3}$/.test(part))) return null;
  const numbers = parts.map(Number);
  return numbers.every((part) => part >= 0 && part <= 255) ? numbers : null;
}
