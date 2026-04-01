/**
 * LOCAL DEVELOPMENT ONLY.
 *
 * Stores DrChrono OAuth tokens in an AES-256-GCM encrypted JSON file.
 * This is NOT suitable for production on Vercel or any serverless
 * platform where the local filesystem is ephemeral.
 */

import { readFile, writeFile, unlink } from "fs/promises";
import { existsSync } from "fs";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import path from "path";
import type { TokenStore, StoredTokens } from "./types";

const ALGORITHM = "aes-256-gcm";
const TOKEN_FILE = path.join(process.cwd(), ".drchrono-tokens.enc");

function getEncryptionKey(): Buffer {
  const secret = process.env.TOKEN_STORE_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "TOKEN_STORE_SECRET must be set to at least 32 characters for local token encryption."
    );
  }
  return Buffer.from(secret.slice(0, 32), "utf-8");
}

function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf-8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  // Store as iv:tag:ciphertext, all hex-encoded
  return [iv.toString("hex"), tag.toString("hex"), encrypted.toString("hex")].join(":");
}

function decrypt(payload: string): string {
  const key = getEncryptionKey();
  const [ivHex, tagHex, dataHex] = payload.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const data = Buffer.from(dataHex, "hex");
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf-8");
}

export class LocalFileTokenStore implements TokenStore {
  async getTokens(): Promise<StoredTokens | null> {
    if (!existsSync(TOKEN_FILE)) return null;
    try {
      const raw = await readFile(TOKEN_FILE, "utf-8");
      const json = decrypt(raw);
      return JSON.parse(json) as StoredTokens;
    } catch (err) {
      console.error("Failed to read local token file:", err);
      return null;
    }
  }

  async setTokens(tokens: StoredTokens): Promise<void> {
    const json = JSON.stringify(tokens);
    const encrypted = encrypt(json);
    await writeFile(TOKEN_FILE, encrypted, "utf-8");
  }

  async clearTokens(): Promise<void> {
    if (existsSync(TOKEN_FILE)) {
      await unlink(TOKEN_FILE);
    }
  }
}
