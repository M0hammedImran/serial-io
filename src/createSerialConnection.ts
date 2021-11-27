import SerialPort from 'serialport';
import type { createSerialConnectionProps, output, WriteDatasetProps } from './types';
import { sleep } from './utils';

interface createSerialConnectionReturnType {
    port: SerialPort;

    /** @description: Factory Reset the thread device. */
    factoryReset(): Promise<void>;

    /**
     * @description: Check the state of the device.
     * @param {string} type - Type of device.
     * @default type 'leader'
     */
    checkState(type?: 'leader' | 'child'): Promise<output>;

    /**
     * @description: Check the initial state of the device.
     * @param {string} type - Type of device.
     * @default type 'leader'
     */
    checkInitialState(type?: 'leader' | 'child'): Promise<output>;

    /** @description: Start IPv6 interface. */
    startIfconfig(): Promise<boolean>;

    /** @description: Start Thread. */
    startThread(): Promise<boolean>;

    /** @description: Check Ipv6 addresses. */
    ipaddr(): Promise<output>;

    /** @description: Write and drain the port. */
    writeToBuffer: (data: string, wait?: number) => Promise<output>;

    /**
     * @description Check the state of the device.
     * @param {WriteDatasetProps} {masterKey, networkName, channel}
     */
    writeDataset(props: WriteDatasetProps): Promise<output>;
}

const clearEventListeners = (port: SerialPort): void => {
    port.removeAllListeners('data');
    port.removeAllListeners('close');
};

/**
 * @description: Create Serial Connection.
 */
export async function createSerialConnection({
    uartPort,
    delimiter = '\r\n',
    baudRate = 115200,
}: createSerialConnectionProps): Promise<createSerialConnectionReturnType> {
    const Readline = SerialPort.parsers.Readline;
    const parser = new Readline({
        encoding: 'utf8',
        delimiter: delimiter,
        includeDelimiter: false,
    });
    const serialPortOptions: SerialPort.OpenOptions = {
        baudRate: baudRate,
        highWaterMark: 1024 * 128, // 128k
        autoOpen: false,
    };
    const port = new SerialPort(uartPort, serialPortOptions, (err) => {
        if (err) return console.log('Error: ', err.message);
    });
    port.pipe(parser);

    const writeToBuffer = (data: string, wait: number = 2000): Promise<{ ok: boolean; data: string[] }> =>
        new Promise((resolve, reject) => {
            let outputData = '';
            port.open((err) => {
                if (err) {
                    return reject(err);
                }
            });
            console.log(`writing ${data}`);
            port.write(data + '\n');
            port.drain();

            sleep(wait).then(() => {
                port.close((err) => {
                    if (err) {
                        return reject(err);
                    }
                    const outputAsArray = String(outputData)
                        .split('\r\n')
                        .filter((val) => !val.includes(data.trim()))
                        .filter((val) => !val.includes('>'));

                    resolve({ ok: outputAsArray.includes('Done'), data: outputAsArray });
                });
            });

            port.on('data', (data) => {
                outputData += data;
            });

            port.on('close', (code) => {
                if (code === null || code === 0) {
                    const outputAsArray = String(outputData)
                        .split('\r\n')
                        .filter((val) => !val.includes(data.trim()))
                        .filter((val) => val !== '>')
                        .filter((val) => val !== '> ');

                    resolve({
                        ok: outputAsArray.includes('Done'),
                        data: outputAsArray.filter((val) => !val.includes('Done')),
                    });
                } else {
                    reject(code);
                }
            });
        });

    const factoryReset = async (): Promise<void> => {
        console.log('factoryreset');

        await writeToBuffer('factoryreset');

        await sleep(3000);

        await writeToBuffer('');
        await writeToBuffer('');

        clearEventListeners(port);
        return;
    };

    const writeDataset = async ({ masterKey, networkName, type = 'leader' }: WriteDatasetProps): Promise<output> => {
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

        const commitActive = await writeToBuffer('dataset commit active');
        if (!commitActive.ok) throw new Error('Failed to commit active dataset');

        const checkActiveDataset = await writeToBuffer('dataset active');

        clearEventListeners(port);

        return checkActiveDataset;
    };

    const checkState = async (type: 'leader' | 'child' = 'leader') => {
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

        clearEventListeners(port);

        return data;
    };

    const checkInitialState = async () => {
        await sleep(1000);
        const cmd = 'state';
        const data = await writeToBuffer(cmd);
        clearEventListeners(port);
        return data;
    };

    const startIfconfig = async () => {
        await sleep(1000);
        const cmd = 'ifconfig up';
        const data = await writeToBuffer(cmd);

        clearEventListeners(port);

        return data.ok;
    };

    const startThread = async () => {
        await sleep(1000);
        const cmd = 'thread start';
        const data = await writeToBuffer(cmd);

        clearEventListeners(port);

        return data.ok;
    };

    const ipaddr = async () => {
        await sleep(1000);
        const cmd = 'ipaddr';
        const data = await writeToBuffer(cmd);

        clearEventListeners(port);

        return data;
    };

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
