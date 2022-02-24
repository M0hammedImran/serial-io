import { SerialConnection } from './SerialConnection';

const UART_PORT = '/dev/ttyUSB1';
const BaudRate = 115200;
const Delimiter = '\r\n';

/** @description Create a child node */
export async function createChildNode() {
    const OPTIONS = {
        uartPort: UART_PORT,
        delimiter: Delimiter,
        baudRate: BaudRate,
    };
    const serial = new SerialConnection(OPTIONS);
    let state = await serial.checkInitialState();

    console.log(`🚀 | file: connectChild.ts | line 20 | state`, state);
    if (state.data[0] === 'child') {
        await serial.writeToBuffer('coap start');
        await serial.writeToBuffer('coap resource config');
        await serial.writeToBuffer('coap set {"type":"gun"}');
    } else {
        const dataset = await serial.writeDataset({
            masterKey: '00112233445566778899aabbccddeeff',
            networkName: 'test',
            type: 'child',
        });

        console.log(`🚀 | file: main.ts | line 24 | dataset`, dataset);

        await serial.startIfconfig();
        await serial.startThread();
        await serial.ipaddr();
        state = await serial.checkState('child');
        console.log(`🚀 | file: connectChild.ts | line 32 | state`, state);
    }

    return state.data[0];
}
