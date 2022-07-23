import express from 'express';
import cors from 'cors';
import categoryRoutes from './routes/categoryRoutes.js';

const server = express();

server.use(cors());
server.use(express.json());

server.use(categoryRoutes);

server.listen(process.env.PORT, () =>
    console.log('servidor rodando')
)