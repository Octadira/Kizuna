import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';

// Ensure the key is exactly 32 bytes
function getKey() {
    const secret = process.env.N8N_ENCRYPTION_KEY;
    if (!secret) {
        throw new Error('N8N_ENCRYPTION_KEY is not defined');
    }
    return crypto.createHash('sha256').update(secret).digest();
}

export function encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const key = getKey();
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return `${iv.toString('hex')}:${encrypted}`;
}

export function decrypt(text: string): string {
    const [ivHex, encryptedHex] = text.split(':');
    if (!ivHex || !encryptedHex) {
        throw new Error('Invalid encrypted text format');
    }

    const iv = Buffer.from(ivHex, 'hex');
    const key = getKey();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}
