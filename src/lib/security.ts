import dns from 'dns/promises';
import { isIP } from 'net';

/**
 * Checks if an IP address is private or reserved.
 */
function isPrivateIP(ip: string): boolean {
    if (isIP(ip) === 4) {
        const parts = ip.split('.').map(Number);
        // 127.0.0.0/8 (Loopback)
        if (parts[0] === 127) return true;
        // 10.0.0.0/8 (Private)
        if (parts[0] === 10) return true;
        // 172.16.0.0/12 (Private)
        if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
        // 192.168.0.0/16 (Private)
        if (parts[0] === 192 && parts[1] === 168) return true;
        // 169.254.0.0/16 (Link-local)
        if (parts[0] === 169 && parts[1] === 254) return true;
        return false;
    } else if (isIP(ip) === 6) {
        // Normalize IPv6 address (simplified check)
        const normalized = ip.toLowerCase();
        // ::1 (Loopback)
        if (normalized === '::1' || normalized.endsWith('::1')) return true;
        // fc00::/7 (Unique Local)
        if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;
        // fe80::/10 (Link-local)
        if (normalized.startsWith('fe80')) return true;
        return false;
    }
    return false;
}

/**
 * Validates a server URL to ensure it doesn't point to a private or internal network.
 * Throws an error if the URL is invalid or unsafe.
 */
export async function validateServerUrl(urlStr: string): Promise<void> {
    let url: URL;
    try {
        url = new URL(urlStr);
    } catch (e) {
        throw new Error("Invalid URL format");
    }

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new Error("Only HTTP and HTTPS protocols are allowed");
    }

    const hostname = url.hostname;

    // Check if hostname is an IP literal
    if (isIP(hostname)) {
        if (isPrivateIP(hostname)) {
            throw new Error("Access to private IP addresses is restricted");
        }
        return;
    }

    // If hostname is 'localhost', reject immediately
    if (hostname === 'localhost') {
        throw new Error("Access to localhost is restricted");
    }

    // Resolve hostname to IP
    try {
        const { address } = await dns.lookup(hostname);
        if (isPrivateIP(address)) {
            throw new Error(`The hostname resolves to a restricted IP address (${address})`);
        }
    } catch (e: any) {
        // If it's our custom error, rethrow it
        if (e.message.includes("restricted IP")) throw e;
        // Otherwise, it might be a DNS error, which effectively means the URL is unreachable/invalid
        throw new Error(`Could not resolve hostname: ${hostname}`);
    }
}
