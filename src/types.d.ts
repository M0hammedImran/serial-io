export interface WriteDatasetProps {
    masterKey: string;
    networkName: string;
    type: 'leader' | 'child';
    panid?: number;
}

export interface createSerialConnectionProps {
    uartPort: string;
    /** @default '\r\n' */
    delimiter?: string;
    /** @default 115200 */
    baudRate?: number;
}

export interface output {
    ok: boolean;
    data: string[];
}
