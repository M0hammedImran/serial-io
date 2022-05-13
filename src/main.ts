import cors from '@fastify/cors';
import fastifyEtag from '@fastify/etag';
import fastifyHelmet from '@fastify/helmet';
import { fastify } from 'fastify';
import fastifyBlipp from 'fastify-blipp';
import { createLeaderNode } from './lib/createLeader';
import { SerialConnection } from './lib/SerialConnection';
import { setGunAttributes, SetGunAttributesProps, START_TARGET } from './lib/utils';

const app = fastify();

app.register(cors, {
    origin: '*',
    allowedHeaders: '*',
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    preflight: true,
});
app.register(fastifyBlipp);
app.register(fastifyEtag);
app.register(fastifyHelmet);

const LEADER_PORT = '/dev/ttyUSB0';
const BAUD_RATE = 115200;

let serial: SerialConnection | null = null;

// (async () => {
//     const port = new SerialPort({ baudRate: BAUD_RATE, path: LEADER_PORT });

//     port?.on('data', (data) => {
//         console.log(String(data));
//     });

// })();

app.get('/healthcheck', async () => {
    return { ok: true };
});

app.get('/gun', async () => {
    const config = setGunAttributes({ ammo_count: 500, mag_count: 10 });
    const target = 'fdde:ad00:beef:0:b72c:ffff:8c18:cfa';

    console.log(await serial?.writeToBuffer(`udp send ${target} 234 ${config}`));

    return { ok: true };
});

app.get('/target', async () => {
    const config = 'GC,start';
    const target = 'fdde:ad00:beef:0:d526:a15c:d9ab:84ff';

    console.log(await serial?.writeToBuffer(`udp send ${target} 234 ${config}`));

    return { ok: true };
});

app.get('/devices', async () => {
    if (!serial) {
        console.log('init serial');

        serial = new SerialConnection({ uartPort: LEADER_PORT, baudRate: 115200 });
    }

    const leader = await createLeaderNode(serial);

    const data = await leader.getDevices();

    return { data: data, ok: true, statusCode: 200 };
});

interface GetDeviceByIdRequestProps {
    Params: { id: string };
}

app.get<GetDeviceByIdRequestProps>('/devices/:id', async (request) => {
    const { id } = request.params;

    // const leader = await createLeaderNode({ baudRate: BAUD_RATE, uartPort: LEADER_PORT });
    // const data = await leader.getDevice(id);

    return { data: id, ok: true, statusCode: 200 };
});

interface PostToConfigGun {
    Body: {
        target: string;
        config: SetGunAttributesProps;
    };
}

interface PostToConfigTarget {
    Body: { target: string };
}

app.post<PostToConfigGun>('/gun', async (request) => {
    const { target, config: gunConfig } = request.body;

    if (!serial) {
        serial = new SerialConnection({ baudRate: BAUD_RATE, uartPort: LEADER_PORT });
    }

    const config = setGunAttributes(gunConfig);

    console.log(await serial.writeToBuffer(`udp send ${target} 234 ${config}`));
    return { ok: true, statusCode: 200 };
});

app.post<PostToConfigTarget>('/target', async (request) => {
    const { target } = request.body;
    if (!serial) {
        serial = new SerialConnection({ baudRate: BAUD_RATE, uartPort: LEADER_PORT });
    }

    console.log(await serial.writeToBuffer(`udp send ${target} 234 ${START_TARGET}`));

    return { ok: true, statusCode: 200 };
});

/** entry function */
async function main() {
    try {
        console.log(await app.listen(4337, '127.0.0.1'));

        if (!serial) {
            console.log('init serial');

            serial = new SerialConnection({ uartPort: LEADER_PORT, baudRate: 115200 });
        }

        app.blipp();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

process.on('uncaughtException', (error) => {
    console.error(error);
});
process.on('unhandledRejection', (error) => {
    console.error(error);
});

main();
