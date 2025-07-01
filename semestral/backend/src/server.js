import Fastify from 'fastify';

const fastify = Fastify({ logger: true });

fastify.get('/', async () => {
  return { status: 'Backend funcionando!' };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    console.log('Servidor listo en http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
