import { createLeaderNode } from './lib/createLeader';
import { createSerialConnection } from './lib/createSerialConnection';

import { fastify } from 'fastify';
import blipp from 'fastify-blipp';
import type { Server, IncomingMessage, ServerResponse } from 'http';
import type { FastifyInstance } from 'fastify';
import dayjs = require('dayjs');

import Etag from 'fastify-etag';
import cors from 'fastify-cors';
import helmet from 'fastify-helmet';

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

// await serial.writeToBuffer(`udp send fdde:ad00:beef:0:105:f1f0:de18:3726 234 ${message}`);

// Declare a route
app.get('/', async (_request, reply) => {
    const serial = await createSerialConnection({ uartPort: '/dev/ttyUSB0', baudRate: 115200, delimiter: '\r\n' });
    const message = JSON.stringify({ ok: true, statusCode: 200 });
    const dataset = await serial.writeToBuffer('dataset active');
    // const data = await serial.writeToBuffer(message);
    // const state = await serial.checkInitialState();
    console.log(JSON.stringify({ dataset }, null, 2));
    return reply.code(200).send({ message, ok: true });
});

app.get('/devices', async (_request, _reply) => {
    const leader = await createLeaderNode();
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

/** entry function */
async function main() {
    try {
        await app.listen(3000, '0.0.0.0');
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
