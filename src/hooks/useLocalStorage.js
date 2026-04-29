import { useState, useEffect } from "react";
import CryptoJS from "crypto-js";

/* ── Encryption key ───────────────────────────────────────────────────────
   Generated once on first use, stored in localStorage.
   The key itself is a 256-bit random hex string.
   NOTE: This protects data from direct inspection of stored values
   (exported files, browser devtools storage tab, extensions).
   It does NOT protect against an attacker who has full localStorage access,
   since the key lives alongside the data in the same browser storage.
──────────────────────────────────────────────────────────────────────────── */
const KEY_REF = "__lifeos_ek__";

function getEncryptionKey() {
  let key = localStorage.getItem(KEY_REF);
  if (!key) {
    // Generate a 256-bit random key on first run
    key = CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex);
    localStorage.setItem(KEY_REF, key);
  }
  return key;
}

/* ── Encrypt / Decrypt ────────────────────────────────────────────────── */
function encrypt(data, key) {
  const plaintext = JSON.stringify(data);
  return CryptoJS.AES.encrypt(plaintext, key).toString();
}

function decrypt(ciphertext, key) {
  const bytes = CryptoJS.AES.decrypt(ciphertext, key);
  const plaintext = bytes.toString(CryptoJS.enc.Utf8);
  if (!plaintext) throw new Error("Decryption produced empty result");
  return JSON.parse(plaintext);
}

/* ── Hook ─────────────────────────────────────────────────────────────── */
export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    // Skip the encryption key entry itself
    if (key === KEY_REF) return initialValue;

    try {
      const stored = localStorage.getItem(key);
      if (!stored) return initialValue;

      const encKey = getEncryptionKey();

      // ── Migration: handle legacy plaintext data ──────────────────────
      // If existing data is unencrypted JSON (from before this update),
      // parse it as-is and it will be re-encrypted on next write.
      try {
        return decrypt(stored, encKey);
      } catch {
        // Stored value wasn't encrypted — try parsing as raw JSON
        try {
          const legacy = JSON.parse(stored);
          // Re-encrypt immediately so it's secured on next write cycle
          localStorage.setItem(key, encrypt(legacy, encKey));
          return legacy;
        } catch {
          return initialValue;
        }
      }
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    if (key === KEY_REF) return;

    try {
      const encKey = getEncryptionKey();
      localStorage.setItem(key, encrypt(value, encKey));
    } catch {
      // Fallback: if encryption fails for any reason, skip the write
      // rather than writing plaintext or crashing the app
      console.warn(`[useLocalStorage] Failed to encrypt "${key}"`);
    }
  }, [key, value]);

  return [value, setValue];
}