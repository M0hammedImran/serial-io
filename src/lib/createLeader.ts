import { output } from '../types';
import { SerialConnection } from './SerialConnection';
import { hex2str, INFO, sleep } from './utils';

interface CreateLeaderNodeProps {
    uartPort: string;
    baudRate: number;
}

/** @description Create a Leader Node */
export async function createLeaderNode(options: CreateLeaderNodeProps) {
    const serial = new SerialConnection(options);

    let state = await serial.checkInitialState();
    console.log({ state });

    const dataset = await serial.writeToBuffer('dataset active');
    console.log({ dataset });

    if (!state.data.includes('leader')) {
        await serial.startIfconfig();
        await serial.startThread();
        await serial.ipaddr();
    }

    let retry = 0;

    while (!state.data.includes('leader')) {
        if (retry > 5) {
            break;
        }

        await sleep(500 * retry);
        state = await serial.checkState();
        retry += 1;
    }

    if (state.data[0] !== 'leader') {
        throw new Error('Serial port is not connected to a Leader Node');
    }

    const getDevices = async () => {
        const data: DeviceData[] = [];
        const output = await serial.writeToBuffer('childip');

        if (output.data.length < 2) {
            throw new Error('No Children connected');
        }

        console.log(`🚀 | output.data.length`, output.data.length);

        const devices = output.data
            .slice(0, output.data.length - 1)
            ?.map((device) => device.split(' ')[1])
            .filter(Boolean);

        if (devices.length === 0) {
            throw new Error('No Children connected');
        }

        for (let i = 0; i < devices.length; i++) {
            const device = devices[i];

            if (!device) continue;

            const { ok } = await serial.writeToBuffer(`udp send ${device} 234 ${INFO}`);
            if (!ok) continue;

            data.push({ ip: device });
        }

        return data;
    };

    return { getDevices };
}

interface DeviceData {
    ip: string;
    type?: Record<string, any>;
}
