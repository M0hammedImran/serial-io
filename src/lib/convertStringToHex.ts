/**
 * @description convert hex string to string
 * @param {string} str - string
 * @return {string}
 */
export function convertStringToHex(str: string): string {
    const hex = Buffer.from(str, 'utf8').toString('hex');
    console.log(hex);
    return hex;
}
