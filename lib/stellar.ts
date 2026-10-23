import { StrKey } from "@stellar/stellar-sdk";

export const INVALID_STELLAR_ADDRESS_MESSAGE = "Enter a valid Stellar address (starts with G or M).";

/**
 * Validate a Stellar address.
 *
 * By default only Ed25519 public keys (G...) are accepted. Pass
 * `{ allowMuxed: true }` to also accept muxed accounts (M...).
 */
export function isValidStellarAddress(
  address: string | null | undefined,
  options: { allowMuxed?: boolean } = {}
): boolean {
  if (!address) return false;
  const trimmed = address.trim();
  if (!trimmed) return false;

  if (StrKey.isValidEd25519PublicKey(trimmed)) return true;
  if (options.allowMuxed && StrKey.isValidMed25519PublicKey(trimmed)) return true;
  return false;
}
