// import { WriteDatasetProps } from '../types';
import { SerialConnection } from './SerialConnection';
import { sleep } from './utils';

interface CreateLeaderNodeProps {
    uartPort: string;
    baudRate: number;
}

// Master Key: 1234c0de1ab51234c0de1ab51234c0de
// Network Name: SleepyEFR32
// PAN ID: 08ae

// const MASTER_KEY = '1234C0DE1AB51234C0DE1AB51234C0DE';
// const NETWORK_NAME = 'SleepyEFR32';
// const PAN_ID = 0x2222;
// const CHANNEL = '15';
// const EXT_PAN_ID = 'C0DE1AB5C0DE1AB5';

// const LEADER_CONFIG: WriteDatasetProps = {
//     masterKey: MASTER_KEY,
//     networkName: NETWORK_NAME,
//     panid: PAN_ID,
//     CHANNEL,
//     EXT_PAN_ID,
//     type: 'leader',
// };

/** @description Create a Leader Node */
export async function createLeaderNode(options: CreateLeaderNodeProps) {
    let retry = 0;
    const serial = new SerialConnection(options);

    let state = await serial.checkState('leader');
    console.dir(state, { depth: null });

    if (!state.data.includes('leader')) {
        // await serial.writeDataset(LEADER_CONFIG);
        await serial.startIfconfig();
        await serial.startThread();
        await serial.ipaddr();
    }

    while (!state.data.includes('leader')) {
        if (retry > 5) break;

        await sleep(500 * retry);
        state = await serial.checkState('leader');
        retry += 1;
    }

    if (state.data[0] !== 'leader') {
        throw new Error('Serial port is not connected to a Leader Node');
    }

    const getDevices = async () => {
        const output = await serial.writeToBuffer('childip');

        console.log(`⚓️ | output`, output);

        if (output.data.length < 2) {
            throw new Error('No Children connected');
        }

        const devices = output.data
            ?.slice(0, output.data.length - 1)
            ?.map((device) => device.split(' ')[1])
            ?.filter(Boolean)
            .map((device) => ({ ip: device }));

        if (devices.length === 0) {
            throw new Error('No Children connected');
        }

        // for (let i = 0; i < devices.length; i++) {
        //     const device = devices[i];

        // if (!device) continue;

        // const { ok } = await serial.writeToBuffer(`udp send ${device} 234 ${INFO}`);
        // if (!ok) continue;

        //     data.push({ ip: device });
        // }

        return devices;
    };

    return { getDevices };
}

// interface DeviceData {
//     ip: string;
//     type?: Record<string, any>;
// }
