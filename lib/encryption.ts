import crypto from "crypto";
import "server-only";

const ALG = "aes-256-cbc"; // key - 32 bytes, iv - 16 bytes

export const symmetricEncrypt = (data: string) => {
    const keyHex = process.env.ENCRYPTION_KEY;
    if (!keyHex) {
        throw new Error("Encryption key not found");
    }

    const key = Buffer.from(keyHex, "hex");
    if (key.length !== 32) {
        throw new Error("Encryption key must be 32 bytes long");
    }

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALG, Buffer.from(key), iv);

    let encrypted = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

export const symmetricDecrypt = (encrypted: string) => {
    const keyHex = process.env.ENCRYPTION_KEY;
    if (!keyHex) {
        throw new Error("Encryption key not found");
    }
    
    const key = Buffer.from(keyHex, "hex");
    if (key.length !== 32) {
        throw new Error("Encryption key must be 32 bytes long");
    }

    const textParts = encrypted.split(":");
    const iv = Buffer.from(textParts.shift() as string, "hex");
    const encryptedText = Buffer.from(textParts.join(":"), "hex");
    const decipher = crypto.createDecipheriv(ALG, Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}