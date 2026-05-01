import { useState, useEffect } from "react";
import CryptoJS from "crypto-js";

/* ── Encryption key ───────────────────────────────────────────────────── */
const KEY_REF = "__lifeos_ek__";

function getEncryptionKey() {
  let key = localStorage.getItem(KEY_REF);
  if (!key) {
    key = CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex);
    localStorage.setItem(KEY_REF, key);
  }
  return key;
}

/* ── Encrypt / Decrypt ────────────────────────────────────────────────── */
function encrypt(data, key) {
  return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
}

function decrypt(ciphertext, key) {
  const bytes     = CryptoJS.AES.decrypt(ciphertext, key);
  const plaintext = bytes.toString(CryptoJS.enc.Utf8);
  if (!plaintext) throw new Error("Decryption produced empty result");
  return JSON.parse(plaintext);
}

/* ── secureGet ────────────────────────────────────────────────────────────
   Named export — use this anywhere you need to read encrypted localStorage
   outside of a React component (Dashboard stats, downloadData, etc.)

   Usage:
     import { secureGet } from "../hooks/useLocalStorage";
     const entries = secureGet("diary-entries", []);
─────────────────────────────────────────────────────────────────────────── */
export function secureGet(key, fallback = null) {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return fallback;

    const encKey = getEncryptionKey();

    // Try decrypting first (normal encrypted path)
    try {
      return decrypt(stored, encKey);
    } catch {
      // Fall back to raw JSON for any legacy unencrypted values
      try {
        return JSON.parse(stored);
      } catch {
        return fallback;
      }
    }
  } catch {
    return fallback;
  }
}

/* ── Hook (default export) ────────────────────────────────────────────── */
export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    if (key === KEY_REF) return initialValue;

    try {
      const stored = localStorage.getItem(key);
      if (!stored) return initialValue;

      const encKey = getEncryptionKey();

      try {
        return decrypt(stored, encKey);
      } catch {
        // Legacy plaintext — parse and re-encrypt on next write
        try {
          const legacy = JSON.parse(stored);
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
      localStorage.setItem(key, encrypt(value, getEncryptionKey()));
    } catch {
      console.warn(`[useLocalStorage] Failed to encrypt "${key}"`);
    }
  }, [key, value]);

  return [value, setValue];
}