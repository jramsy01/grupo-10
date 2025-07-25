import Fastify from 'fastify';
import cors from '@fastify/cors';
import {connect} from '../../DB/db.js';
import {Users} from '../../DB/models.js';

const PORT = 3000;
const MONGO_URI = 'mongodb://root:example@localhost:27017/';

const fastify = Fastify({
    logger: true,
}); 

fastify.register(cors, {
    origin: "*",
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
});

fastify.get('/api/v1/login/:email', async (request, reply) => {
   try{
        const user = await Users.findOne({correo: request.params.email});
        if(!user){
            return {mensaje: 'Correo no encontrado'};
        }
        return user;
    }catch (err){
        return reply.status(500).send({mensaje: 'Error interno del servidor', error: err.message});
    }
});

fastify.post('/api/v1/signup', async (request, reply) => {
    try{
        const user = await Users.create(request.body);
        return reply.status(200).send({mensaje: 'Usuario registrado'});
    }catch (err){
        return reply.status(500).send({mensaje: 'Error interno del servidor', error: err.message});
    }
    
});

const start = async () => {
    try{
        await connect(MONGO_URI);
        console.log("conectado a mongoDB")
        await fastify.listen({ port: PORT});
    }catch (err){
        fastify.log.error(err);
        process.exit(1);
    }
};

start();