import express from 'express';
import cors from 'cors';
import categoryRoutes from './routes/categoryRoutes.js';
import gameRoutes from './routes/gameRoutes.js';

const server = express();

server.use(cors());
server.use(express.json());

server.use(categoryRoutes);
server.use(gameRoutes);

server.listen(process.env.PORT, () =>
    console.log('servidor rodando')
)