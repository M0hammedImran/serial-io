/**
 * @param {number} ms
 * @description sleep for a given time
 * @return {Promise<void>} Promise<void>
 */
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * @description convert hexadecimal to string
 * @param {string} hex string
 * @return {string} string
 */
export function hex2str(hex: string): string {
    const str = (hex.match(/[\s\S]{1,2}/g) || []).filter((v) => v !== '00');
    return str.map((v) => String.fromCharCode(parseInt(v, 16))).join('');
}
