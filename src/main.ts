import { createSerialConnection } from './createSerialConnection';

const UART_PORT = '/dev/ttyUSB0';
const BaudRate = 115200;
const Delimiter = '\r\n';

/**
 * entry function
 */
async function main() {
    try {
        const OPTIONS = {
            uartPort: UART_PORT,
            delimiter: Delimiter,
            baudRate: BaudRate,
        };

        const props = await createSerialConnection(OPTIONS);
        const { port, writeDataset, checkState, ipaddr, startIfconfig, startThread } = props;

        // await factoryReset();
        const dataset = await writeDataset({
            masterKey: 'cce524b24253d9da19965a83d50eb749',
            networkName: 'test',
            channel: 10,
        });
        console.log(`🚀 | file: main.ts | line 24 | dataset`, dataset);
        await startIfconfig();
        await startThread();
        await ipaddr();
        const data = await checkState();
        console.log(`🚀 | file: main.ts | line 32 | data`, data);

        port.listenerCount('data') > 0 && port.removeAllListeners('data');
        port.listenerCount('close') > 0 && port.removeAllListeners('close');

        port.on('error', console.log);
    } catch (error) {
        console.log(error);
    }
}

main()
    .then(() => void 0)
    .catch(console.error);
