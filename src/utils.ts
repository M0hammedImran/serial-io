/**
 * @param {number} ms
 * @description sleep for a given time
 * @return {Promise<void>} Promise<void>
 */
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * @function parseBufferToString
 * @param {Buffer} buffer
 * @return {string}
 */
export function parseBufferToString(buffer: Buffer): string {
    console.log(
        buffer.toString('utf8'),
        // .split('\r\n')
        // .filter((v) => !v.includes('>')),
    );
    return buffer.toString('utf8');
}
