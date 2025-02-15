import { secp256k1 } from "@noble/curves/secp256k1";
import { DirectSecp256k1Wallet } from "@cosmjs/proto-signing";

/**
 * Generates a random 32-byte private key
 * @returns {Object} An object containing the generated private and public keys
 */
export function generatePrivateKey() {
	const pk = secp256k1.utils.randomPrivateKey();
	console.log("Generated private key:", Buffer.from(pk).toString("hex"));
	const pub = secp256k1.getPublicKey(pk);
	console.log("Generated public key:", Buffer.from(pub).toString("hex"));
	return {
		privateKey: pk,
		publicKey: pub,
	};
}

/**
 * Derives the public key from a private key using secp256k1
 * @param {Uint8Array} privateKey - The private key to derive from
 * @returns {Uint8Array} The corresponding public key
 */
export function getPublicKey(privateKey) {
	const publicKey = secp256k1.getPublicKey(privateKey);
	console.log("Derived public key:", Buffer.from(publicKey).toString("hex"));
	return publicKey;
}

/**
 * Utility function to convert a key to hex string
 * @param {Uint8Array} key - The key to convert
 * @returns {string} The hex string representation
 */
export function keyToHex(key) {
	return Buffer.from(key).toString("hex");
}

/**
 * Creates a Nilchain signer from a hex string key
 * @param {string} key - The hex string representation of the private key
 * @returns {Promise<DirectSecp256k1Wallet>} The created Nilchain signer
 */
export const createNilchainSignerFromKey = async (key) => {
	const NilChainAddressPrefix = "nil";
	const privateKey = new Uint8Array(key.length / 2);
	for (let i = 0, j = 0; i < key.length; i += 2, j++) {
		privateKey[j] = parseInt(key.slice(i, i + 2), 16);
	}
	return await DirectSecp256k1Wallet.fromKey(privateKey, NilChainAddressPrefix);
};

export const toBigInt = (bytes) => {
	let ret = 0n;
	for (const value of bytes.values()) {
		ret = (ret << 8n) + BigInt(value);
	}
	return ret;
};
