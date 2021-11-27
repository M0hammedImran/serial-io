import { createLeaderNode } from './createLeader';
import fastify, { FastifyInstance } from 'fastify';

const app: FastifyInstance = fastify({ logger: true });

// Declare a route
app.get('/', async (_request, _reply) => {
    return { message: 'NO_DATA', ok: true, statusCode: 204 };
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
