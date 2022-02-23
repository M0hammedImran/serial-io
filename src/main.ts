import { createLeaderNode } from './lib/createLeader';
import { createSerialConnection } from './lib/createSerialConnection';
import fastify, { FastifyInstance } from 'fastify';

const app: FastifyInstance = fastify({
    logger: { prettyPrint: true },
});

// Declare a route
app.get('/', async (_request, _reply) => {
    const serial = await createSerialConnection({ uartPort: '/dev/ttyS0', delimiter: '\r\n', baudRate: 115200 });
    const message = JSON.stringify({ ok: true, statusCode: 200 });

    await serial.writeToBuffer(`udp send fdde:ad00:beef:0:105:f1f0:de18:3726 234 ${message}`);

    return { message, length: message.length, ok: true, statusCode: 200 };
});

app.get('/get_devices', async (_request, _reply) => {
    const leader = await createLeaderNode();
    const data = await leader.getDevices();
    console.log(`🚀 | file: main.ts | line 14 | data`, data);
    return { data: data, ok: true, statusCode: 200 };
});

app.get<{ Params: { id: string } }>('/get_device/:id', async (request, _reply) => {
    const { id } = request.params;

    // const data = await getDevice(id);
    return { data: id, ok: true, statusCode: 200 };
});

/** entry function */
async function main() {
    try {
        await app.listen(3000);
    } catch (error) {
        console.log(error);
        app.log.error(error);
        process.exit(1);
    }
}

main()
    .then(() => void 0)
    .catch(console.error);
