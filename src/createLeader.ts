import { output } from './types';
import { createSerialConnection } from './createSerialConnection';
import { hex2str } from './utils';

const UART_PORT = '/dev/ttyUSB0';
const BaudRate = 115200;
const Delimiter = '\r\n';

/** @description Create a Leader Node */
export async function createLeaderNode() {
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

        state = await checkInitialState('leader');

        if (state.data[0] === 'leader') {
            await writeToBuffer('coap start');
        } else {
            const dataset = await writeDataset({
                masterKey: '00112233445566778899aabbccddeeff',
                networkName: 'test',
                type: 'leader',
            });

            console.log(`🚀 | file: main.ts | line 24 | dataset`, dataset);

            await startIfconfig();
            await startThread();
            await ipaddr();

            state = await checkState();
        }

        port.listenerCount('data') > 0 && port.removeAllListeners('data');
        port.listenerCount('close') > 0 && port.removeAllListeners('close');

        port.on('error', (err) => {
            if (err) throw err;
        });

        const getDevices = async () => {
            const output = await writeToBuffer('childip');
            console.log(`🚀 | file: createLeader.ts | line 50 | output`, output);

            const devices = output.data.map((device) => device.split(' ')[1]);

            const data: { ip: string; type: Record<string, any> }[] = [];

            for (let i = 0; i < devices.length; i++) {
                const device = devices[i];
                if (!device) break;
                const type = await writeToBuffer(`coap get ${device} config`);
                const typeData = type.data[0].split('payload: ');
                if (!typeData[1]) break;
                const _data = JSON.parse(hex2str(typeData[1]) || '{}');
                if (!_data?.type) break;
                data.push({ ip: device, type: _data?.type });
                console.log(`🚀 | file: createLeader.ts | line 66 | data`, data);
            }

            console.log(`🚀 | file: createLeader.ts | line 69 | data`, data);
            return data;
        };

        return { getDevices };
    } catch (err) {
        throw err;
    }
}

createLeaderNode();
