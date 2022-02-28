import { LinuxBinding, LinuxPortBinding } from '@serialport/bindings-cpp';
import type { createSerialConnectionProps, output, WriteDatasetProps } from '../types';
import { sleep } from './utils';

/** @description Create Serial Connection.*/
export class SerialConnection {
    options: { path: any; baudRate: any; highWaterMark: number; autoOpen: boolean };
    port: LinuxPortBinding;

    constructor({ uartPort, baudRate }: createSerialConnectionProps) {
        this.options = { path: uartPort, baudRate, highWaterMark: 1024 * 128, autoOpen: false };
    }

    /** @description Write and drain the port. */
    public async writeToBuffer(input: string): Promise<output> {
        this.port = await LinuxBinding.open(this.options);

        if (!this.port.isOpen) {
            throw new Error('Port is not open');
        }

        await this.port.write(Buffer.from(input + '\n'));

        const inputBuffer = Buffer.alloc(2 ** 16);

        const data = await this.port.read(inputBuffer, 0, 2 ** 14);
        const stringBuffer = String(data.buffer).replaceAll('\x00', '').trimEnd();

        const outputAsArray = stringBuffer
            .split('\r\n')
            .filter((val) => !val.includes(input.trim()))
            .filter((val) => val !== '>' && val !== '> ');

        console.log({ outputAsArray });

        this.port.close();
        return { data: outputAsArray, ok: outputAsArray.includes('Done') };
    }

    /** @description Factory Reset the thread device. */
    async factoryReset() {
        await this.writeToBuffer('factoryreset');
        await sleep(3000);
        await this.writeToBuffer('');
        await this.writeToBuffer('');
        return;
    }

    /**
     * @description Check the state of the device.
     * @param {WriteDatasetProps} {masterKey, networkName, channel}
     */
    async writeDataset({ masterKey, networkName, type = 'leader', panid }: WriteDatasetProps): Promise<output> {
        const clear = await this.writeToBuffer('dataset clear');
        if (!clear.ok) throw new Error('Failed to clear dataset');

        if (type === 'leader') {
            const init = await this.writeToBuffer(`dataset init new`);
            if (!init.ok) throw new Error('Failed to init dataset');
        }

        const setMasterKey = await this.writeToBuffer(`dataset masterkey ${masterKey}`);
        if (!setMasterKey.ok) throw new Error('Failed to set masterKey');

        const setNetworkName = await this.writeToBuffer(`dataset networkname ${networkName}`);
        if (!setNetworkName.ok) throw new Error('Failed to set networkName');

        const setPanid = await this.writeToBuffer(`dataset panid ${panid}`);
        if (!setPanid.ok) throw new Error('Failed to set networkName');

        const commitActive = await this.writeToBuffer('dataset commit active');
        if (!commitActive.ok) throw new Error('Failed to commit active dataset');

        const checkActiveDataset = await this.writeToBuffer('dataset active');

        return checkActiveDataset;
    }

    /**
     * @description Check the state of the device.
     * @param {string} type - Type of device.
     * @default type 'leader'
     */
    async checkState(type: 'leader' | 'child' = 'leader') {
        const cmd = 'state';
        let data: output;
        data = await this.writeToBuffer(cmd);

        if (type === 'leader' && !data.data.includes(type)) {
            data = await this.writeToBuffer(cmd);
        }

        if (type === 'child' && !data.data.includes(type)) {
            data = await this.writeToBuffer(cmd);
        }

        return data;
    }

    /** @description Check the initial state of the device. */
    async checkInitialState(): Promise<output> {
        const data = await this.writeToBuffer('state');
        return data;
    }

    /** @description Start IPv6 interface. */
    async startIfconfig() {
        const data = await this.writeToBuffer('ifconfig up');
        return data.ok;
    }

    /** @description Start Thread. */
    async startThread() {
        const cmd = 'thread start';
        const data = await this.writeToBuffer(cmd);

        return data.ok;
    }

    /** @description Check Ipv6 addresses. */
    async ipaddr() {
        const cmd = 'ipaddr';
        const data = await this.writeToBuffer(cmd);

        return data;
    }
}
