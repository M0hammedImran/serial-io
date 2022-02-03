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
        const serial = await createSerialConnection(OPTIONS);

        state = await serial.checkInitialState('leader');

        if (state.data[0] === 'leader') {
            await serial.writeToBuffer('coap start');
        } else {
            const dataset = await serial.writeDataset({
                masterKey: '1234c0de1ab51234c0de1ab51234c0de',
                networkName: 'SleepyEFR32',
                type: 'leader',
                panid: 2222,
            });

            console.log(`🚀 | file: main.ts | line 24 | dataset`, dataset);

            await serial.startIfconfig();
            await serial.startThread();
            await serial.ipaddr();

            state = await serial.checkState();
        }

        serial.port.listenerCount('data') > 0 && serial.port.removeAllListeners('data');
        serial.port.listenerCount('close') > 0 && serial.port.removeAllListeners('close');

        serial.port.on('error', (err) => {
            if (err) throw err;
        });

        const getDevices = async () => {
            const output = await serial.writeToBuffer('childip');
            const devices = output.data.map((device) => device.split(' ')[1]);
            const data: { ip: string; type: Record<string, any> }[] = [];
            for (let i = 0; i < devices.length; i++) {
                const device = devices[i];
                if (!device) break;
                const type = await serial.writeToBuffer(`coap get ${device} config`);
                const typeData = type.data[0].split('payload: ');
                if (!typeData[1]) break;
                const _data = JSON.parse(hex2str(typeData[1]) || '{}');
                if (!_data?.type) break;
                data.push({ ip: device, type: _data?.type });
            }
            return data;
        };

        return { getDevices };
    } catch (err) {
        throw err;
    }
}

// createLeaderNode().catch((err) => {
//     console.log(err);
//     process.exit(1);
// });
