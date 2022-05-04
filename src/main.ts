import { fastify } from 'fastify';
import fastifyBlipp from 'fastify-blipp';
import cors from 'fastify-cors';
import fastifyEtag from 'fastify-etag';
import fastifyHelmet from 'fastify-helmet';
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

const LEADER_PORT = '/dev/ttyUSB1';
const BAUD_RATE = 115200;

let serial: SerialConnection | null = null;

app.get('/', async () => {
    serial = new SerialConnection({ uartPort: LEADER_PORT, baudRate: 115200 });

    const dataset = await serial.writeToBuffer('dataset active');

    console.dir(dataset, { depth: null });
    return { ok: true };
});

app.get('/devices', async () => {
    const leader = await createLeaderNode({ baudRate: BAUD_RATE, uartPort: LEADER_PORT });
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

        // console.table(await getNodes());
        app.blipp();
    } catch (error) {
        app.log.error(error);
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
