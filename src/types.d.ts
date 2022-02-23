export interface WriteDatasetProps {
    masterKey: string;
    networkName: string;
    type: 'leader' | 'child';
    panid?: number;
}

export interface createSerialConnectionProps {
    /** @example '/dev/ttyS0 */
    uartPort: string;
    /** @example '\r\n' */
    delimiter?: string;
    /** @example 115200 */
    baudRate?: number;
}

export interface output {
    ok: boolean;
    data: string[];
}
