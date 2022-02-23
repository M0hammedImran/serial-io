import { autoDetect, LinuxBinding } from '@serialport/bindings-cpp';
import type { createSerialConnectionProps, output, WriteDatasetProps } from '../types';
import { sleep } from './utils';

/** @description Create Serial Connection.*/
export async function createSerialConnection({ uartPort, delimiter, baudRate }: createSerialConnectionProps) {
    const options = { path: uartPort, baudRate, highWaterMark: 1024 * 128, autoOpen: false };

    const port = await LinuxBinding.open(options);

    /** @description Write and drain the port. */
    async function writeToBuffer(input: string): Promise<output> {
        if (!port.isOpen) {
            throw new Error('Port is not open');
        }

        await port.write(Buffer.from(input + '\n'));

        const inputBuffer = Buffer.alloc(163840);

        const data = await port.read(inputBuffer, 0, 16384);
        // Buffer.console.log(`🚀 | file: createSerialConnection.ts | line 24 | data.buffer`, String(data.buffer));

        console.log(`🚀 | file: createSerialConnection.ts | line 25 | String(data.buffer)`, String(data.buffer));

        const outputAsArray = String(data.buffer)
            .split('\r\n')
            .filter((val) => !val.includes(input.trim()))
            .filter((val) => val !== '>' && val !== '> ');
        // .filter((val) => !val.includes('\x00'));

        // await port.flush();
        // await port.drain();
        return { data: outputAsArray, ok: outputAsArray.includes('Done') };
    }

    /** @description Factory Reset the thread device. */
    async function factoryReset(): Promise<void> {
        console.log('factoryreset');
        await writeToBuffer('factoryreset');
        await sleep(3000);
        await writeToBuffer('');
        await writeToBuffer('');
        return;
    }

    /**
     * @description Check the state of the device.
     * @param {WriteDatasetProps} {masterKey, networkName, channel}
     */
    async function writeDataset({
        masterKey,
        networkName,
        type = 'leader',
        panid,
    }: WriteDatasetProps): Promise<output> {
        console.log('writing dataset');

        const clear = await writeToBuffer('dataset clear');
        if (!clear.ok) throw new Error('Failed to clear dataset');

        if (type === 'leader') {
            const init = await writeToBuffer(`dataset init new`);
            console.log(`🚀 | file: createSerialConnection.ts | line 144 | init`, init);
            if (!init.ok) throw new Error('Failed to init dataset');
        }

        const setMasterKey = await writeToBuffer(`dataset masterkey ${masterKey}`);
        if (!setMasterKey.ok) throw new Error('Failed to set masterKey');

        const setNetworkName = await writeToBuffer(`dataset networkname ${networkName}`);
        if (!setNetworkName.ok) throw new Error('Failed to set networkName');

        const setPanid = await writeToBuffer(`dataset panid ${panid}`);
        if (!setPanid.ok) throw new Error('Failed to set networkName');

        const commitActive = await writeToBuffer('dataset commit active');
        if (!commitActive.ok) throw new Error('Failed to commit active dataset');

        const checkActiveDataset = await writeToBuffer('dataset active');

        return checkActiveDataset;
    }

    /**
     * @description Check the state of the device.
     * @param {string} type - Type of device.
     * @default type 'leader'
     */
    async function checkState(type: 'leader' | 'child' = 'leader') {
        await sleep(1000);
        const cmd = 'state';
        let data: output;
        data = await writeToBuffer(cmd);

        if (type === 'leader' && !data.data.includes(type)) {
            data = await writeToBuffer(cmd);
        }

        if (type === 'child' && !data.data.includes(type)) {
            data = await writeToBuffer(cmd);
        }

        return data;
    }

    /**
     * @description Check the initial state of the device.
     * @param {string} type - Type of device.
     * @default type 'leader'
     */
    async function checkInitialState() {
        await sleep(1000);
        const data = await writeToBuffer('state');

        return data;
    }

    /** @description Start IPv6 interface. */
    async function startIfconfig() {
        await sleep(1000);
        const data = await writeToBuffer('ifconfig up');

        return data.ok;
    }

    /** @description Start Thread. */
    async function startThread() {
        await sleep(1000);
        const cmd = 'thread start';
        const data = await writeToBuffer(cmd);

        return data.ok;
    }

    /** @description Check Ipv6 addresses. */
    async function ipaddr() {
        await sleep(1000);
        const cmd = 'ipaddr';
        const data = await writeToBuffer(cmd);

        return data;
    }

    return {
        port,
        factoryReset,
        writeDataset,
        checkState,
        startIfconfig,
        startThread,
        ipaddr,
        writeToBuffer,
        checkInitialState,
    };
}
