// import { WriteDatasetProps } from '../types';
import { SerialConnection } from './SerialConnection';
import { INFO, sleep } from './utils';

// Master Key: 1234c0de1ab51234c0de1ab51234c0de
// Network Name: SleepyEFR32
// PAN ID: 08ae

/** @description Create a Leader Node */
export async function createLeaderNode(serial: SerialConnection) {
    let retry = 0;

    let state = await serial.checkState('leader');

    if (!state.data.includes('leader')) {
        await serial.startIfconfig();
        await serial.startThread();
        await serial.ipaddr();
    }

    while (!state.data.includes('leader')) {
        console.log(`⚓️ | retry`, retry);
        if (retry > 5) break;

        await sleep(500 * retry);
        state = await serial.checkState('leader');
        retry += 1;
    }

    if (state.data[0] !== 'leader') {
        throw new Error('Serial port is not connected to a Leader Node');
    }

    const getDevices = async () => {
        const deviceData: DeviceData[] = [];
        const output = await serial.writeToBuffer('childip');

        if (output.data.length < 2) {
            throw new Error('No Children connected');
        }

        const devices = output.data
            ?.slice(0, output.data.length - 1)
            ?.map((device) => device.split(' ')[1])
            ?.filter(Boolean);
        // .map((device) => ({ ip: device }));

        if (devices.length === 0) {
            throw new Error('No Children connected');
        }

        for (let i = 0; i < devices.length; i++) {
            const device = devices[i];

            if (!device) continue;

            const { data: res, ok } = await serial.writeToBuffer(`udp send ${device} 234 ${INFO}`);
            if (!ok) continue;

            const data = { ip: device, type: '' };

            if (res.some((r) => r.includes('mtd'))) {
                data.type = 'target';
            }

            // const port = await serial?.getPort();

            // const inputBuffer = Buffer.alloc(256);

            // let counter = 0;

            // // eslint-disable-next-line no-constant-condition
            // while (true) {
            //     console.log(`⚓️ | counter`, counter);
            //     const databuffer = await port?.read(inputBuffer, 0, 256);

            //     const data = String(databuffer);
            //     console.log(`⚓️ | data`, data);

            //     if (data.includes('mtd')) {
            //         break;
            //     }

            //     if (counter > 10) {
            //         break;
            //     }

            //     counter++;
            // }    // }

            deviceData.push(data);
        }

        return deviceData;
    };

    return { getDevices };
}

interface DeviceData {
    ip: string;
    type?: string;
}
