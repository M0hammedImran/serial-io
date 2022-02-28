import dayjs = require('dayjs');
import type { FastifyInstance } from 'fastify';
import { fastify } from 'fastify';
import blipp from 'fastify-blipp';
import cors from 'fastify-cors';
import Etag from 'fastify-etag';
import helmet from 'fastify-helmet';
import type { IncomingMessage, Server, ServerResponse } from 'http';
import { getNodes, START_TARGET } from './lib/utils';
import { createLeaderNode } from './lib/createLeader';
import { SerialConnection } from './lib/SerialConnection';

const app: FastifyInstance<Server, IncomingMessage, ServerResponse> = fastify({
    logger: {
        prettyPrint: {
            colorize: true,
            translateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            ignore: 'pid,hostname,v',
            levelFirst: true,
        },
    },
});

app.register(blipp);
app.register(Etag);
app.register(cors, { origin: '*' });
app.register(helmet);

const LEADER_PORT = '/dev/ttyUSB0';
const BAUD_RATE = 115200;

// await serial.writeToBuffer(`udp send fdde:ad00:beef:0:105:f1f0:de18:3726 234 ${message}`);

// Declare a route
app.get('/', async (_request, reply) => {
    const serial = new SerialConnection({ uartPort: LEADER_PORT, baudRate: 115200 });

    const message = JSON.stringify({ ok: true, statusCode: 200 });
    const dataset = await serial.writeToBuffer('dataset active');
    console.log(JSON.stringify({ dataset }, null, 2));
    return reply.code(200).send({ message, ok: true });
});

app.get('/devices', async (_request, _reply) => {
    const leader = await createLeaderNode({ baudRate: BAUD_RATE, uartPort: LEADER_PORT });

    const data = await leader.getDevices();
    console.log(`🚀 | file: main.ts | line 14 | data`, data);
    return { data: data, ok: true, statusCode: 200 };
});

interface GetDeviceByIdRequestProps {
    Params: { id: string };
}

app.get<GetDeviceByIdRequestProps>('/devices/:id', async (request, _reply) => {
    const { id } = request.params;

    // const data = await getDevice(id);
    return { data: id, ok: true, statusCode: 200 };
});

app.get('/client', async (_request, _reply) => {
    const leader = await createLeaderNode({ baudRate: BAUD_RATE, uartPort: LEADER_PORT });

    const data = await leader.getDevices();

    return { data: data, ok: true, statusCode: 200 };
});

app.post<{ Body: { target: string } }>('/target', async (request, _reply) => {
    const target = request.body.target;

    const serial = new SerialConnection({ baudRate: BAUD_RATE, uartPort: LEADER_PORT });

    serial.writeToBuffer(`udp send ${target} 234 ${START_TARGET}`);

    return { ok: true, statusCode: 200 };
});

/** entry function */
async function main() {
    try {
        await app.listen(4337, '0.0.0.0');

        console.table(await getNodes());

        app.blipp();
    } catch (error) {
        console.log(error);
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
