import type { output } from './types';
import { createSerialConnection } from './createSerialConnection';

const UART_PORT = '/dev/ttyUSB1';
const BaudRate = 115200;
const Delimiter = '\r\n';

/** @description Create a child node */
export async function createChildNode() {
    try {
        const OPTIONS = {
            uartPort: UART_PORT,
            delimiter: Delimiter,
            baudRate: BaudRate,
        };
        let state: output;
        const props = await createSerialConnection(OPTIONS);
        const { port, writeDataset, checkState, checkInitialState, ipaddr, startIfconfig, startThread, writeToBuffer } =
            props;
        state = await checkInitialState('child');

        console.log(`🚀 | file: connectChild.ts | line 20 | state`, state);
        if (state.data[0] === 'child') {
            await writeToBuffer('coap start');
            await writeToBuffer('coap resource config');
            await writeToBuffer('coap set {"type":"gun"}');
        } else {
            const dataset = await writeDataset({
                masterKey: '00112233445566778899aabbccddeeff',
                networkName: 'test',
                type: 'child',
            });

            console.log(`🚀 | file: main.ts | line 24 | dataset`, dataset);

            await startIfconfig();
            await startThread();
            await ipaddr();
            state = await checkState('child');
            console.log(`🚀 | file: connectChild.ts | line 32 | state`, state);
        }

        port.listenerCount('data') > 0 && port.removeAllListeners('data');
        port.listenerCount('close') > 0 && port.removeAllListeners('close');

        port.on('error', (err) => {
            if (err) throw err;
        });

        return state.data[0];
    } catch (err) {
        throw err;
    }
}

createChildNode();
