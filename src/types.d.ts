export interface WriteDatasetProps {
    masterKey: string;
    networkName: string;
    type: 'leader' | 'child';
    panid?: number;
    CHANNEL: string;
    EXT_PAN_ID: string;
}

export interface createSerialConnectionProps {
    /** @example '/dev/ttyS0 */
    uartPort: string;
    /** @example 115200 */
    baudRate?: number;
}

export interface output {
    ok: boolean;
    data: string[];
}
