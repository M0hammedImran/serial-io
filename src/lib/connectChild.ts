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
    let state = await serial.checkState('child');

    if (state.data[0] === 'child') {
        await serial.writeToBuffer('coap start');
        await serial.writeToBuffer('coap resource config');
        await serial.writeToBuffer('coap set {"type":"gun"}');
    } else {
        // const dataset = await serial.writeDataset({
        //     masterKey: '00112233445566778899aabbccddeeff',
        //     networkName: 'test',
        //     type: 'child',
        // });

        await serial.startIfconfig();
        await serial.startThread();
        await serial.ipaddr();
        state = await serial.checkState('child');
    }

    return state.data[0];
}
