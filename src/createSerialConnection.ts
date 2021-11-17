import SerialPort from 'serialport';
import type { createSerialConnectionProps, output, WriteDatasetProps } from './types';
import { sleep } from './utils';

interface createSerialConnectionReturnType {
    port: SerialPort;

    /** @description: Factory Reset the thread device. */
    factoryReset(): Promise<void>;

    /** @description: Check the state of the device. */
    checkState(): Promise<output>;

    /** @description: Start IPv6 interface. */
    startIfconfig(): Promise<boolean>;

    /** @description: Start Thread. */
    startThread(): Promise<boolean>;

    /** @description: Check Ipv6 addresses. */
    ipaddr(): Promise<output>;

    /** @description: Write and drain the port. */
    writeToBuffer: (data: string) => Promise<output>;

    /**
     * @description Check the state of the device.
     * @param {WriteDatasetProps} {masterKey, networkName, channel}
     */
    writeDataset({ masterKey, networkName, channel }: WriteDatasetProps): Promise<output>;
}

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

    const writeToBuffer = (data: string): Promise<{ ok: boolean; data: string[] }> =>
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

            sleep(2000).then(() => {
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

                port.removeListener('data', () => console.log('closing "data" event listener:', data));
            });

            port.on('close', (code) => {
                if (code === null || code === 0) {
                    const outputAsArray = String(outputData)
                        .split('\r\n')
                        .filter((val) => !val.includes(data.trim()))
                        .filter((val) => !val.includes('>'));

                    port.removeListener('close', () => console.log('closing "close" event listener:', data));

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

        writeToBuffer('factoryreset');

        await sleep(3000);

        await writeToBuffer('\n');
        await writeToBuffer('\n');
        return;
    };

    const writeDataset = async ({
        masterKey,
        networkName,
        channel = 12,
        panid = '0x1234',
    }: WriteDatasetProps): Promise<output> => {
        console.log('writing dataset');

        const init = await writeToBuffer(`dataset init new`);
        port.removeAllListeners('data');
        port.removeAllListeners('close');
        if (!init.ok) throw new Error('Failed to init dataset');

        const setMasterKey = await writeToBuffer(`dataset masterkey ${masterKey}`);
        port.removeAllListeners('data');
        port.removeAllListeners('close');
        if (!setMasterKey.ok) throw new Error('Failed to set masterKey');

        const setNetworkName = await writeToBuffer(`dataset networkname ${networkName}`);
        port.removeAllListeners('data');
        port.removeAllListeners('close');
        if (!setNetworkName.ok) throw new Error('Failed to set networkName');

        const setChannel = await writeToBuffer(`dataset channel ${channel}`);
        port.removeAllListeners('data');
        port.removeAllListeners('close');
        if (!setChannel.ok) throw new Error('Failed to set channel');

        const setPanId = await writeToBuffer(`dataset panid ${panid}`);
        port.removeAllListeners('data');
        port.removeAllListeners('close');
        if (!setPanId.ok) throw new Error('Failed to set channel');

        const commitActive = await writeToBuffer('dataset commit active');
        port.removeAllListeners('data');
        port.removeAllListeners('close');
        if (!commitActive.ok) throw new Error('Failed to commit active dataset');

        const checkActiveDataset = await writeToBuffer('dataset active');
        port.removeAllListeners('data');
        port.removeAllListeners('close');

        return checkActiveDataset;
    };

    const checkState = async () => {
        await sleep(1000);
        console.log('Check state');
        let data: output;
        data = await writeToBuffer('state');
        if (!data.data.includes('leader')) {
            data = await writeToBuffer('state');
        }
        return data;
    };

    const startIfconfig = async () => {
        await sleep(1000);
        console.log('ifconfig up');
        const data = await writeToBuffer('ifconfig up');
        return data.ok;
    };

    const startThread = async () => {
        await sleep(1000);
        console.log('thread start');
        const data = await writeToBuffer('thread start');
        return data.ok;
    };

    const ipaddr = async () => {
        await sleep(1000);
        console.log('ipaddr');
        const data = await writeToBuffer('ipaddr');
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
    };
}
