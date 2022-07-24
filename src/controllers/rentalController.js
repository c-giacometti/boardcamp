import dayjs from 'dayjs';
import connection from '../dbStrategy/database.js';
import { rentalSchema } from '../schemas/rentalSchema.js';

export async function getRentals(req, res){

    try {

        const { customerId, gameId } = req.query;

        //filtrar por customerId e gameId
        if(customerId && gameId){
            const { rows: rentals } = await connection.query(`
                SELECT * FROM rentals
                WHERE "customerId"= $1
                AND "gameId"= $2`,
                [customerId, gameId]
            );

            return res.status(200).send(rentals);
        }

        //filtrar por customerId
        if(customerId){
            const { rows: rentals } = await connection.query(`
                SELECT * FROM rentals
                WHERE "customerId"= $1`,
                [customerId]
            );

            return res.status(200).send(rentals);
        }

        //filtrar por gameId
        if(gameId){
            const { rows: rentals } = await connection.query(`
                SELECT * FROM rentals
                WHERE "gameId"= $1`,
                [gameId]
            );

            return res.status(200).send(rentals);
        }

        //sem filtro
        const { rows: rentals } = await connection.query(`SELECT * FROM rentals`);

        res.status(200).send(rentals);

    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}

export async function newRental(req, res){

    try {

        const rentalData = req.body;
        const { customerId, gameId, daysRented } = rentalData;

        //validar formato dos dados
        const validData = rentalSchema.validate(rentalData);

        if(validData.error){
            return res.status(400).send('Dados incorretos');
        }

        //validar se cliente existe
        const { rows: customerExists } = await connection.query(`
            SELECT * FROM customers
            WHERE id= $1`,
            [customerId]
        );

        if(customerExists.length === 0){
           return res.status(400).send('Cliente não existe');
        }

        //validar se jogo existe
        const { rows: gameExists } = await connection.query(`
            SELECT * FROM games
            WHERE id= $1`,
            [gameId]
        );

        if(gameExists.length === 0){
            return res.status(400).send('Jogo não existe');
        }

        //validar se existem jogos no estoque no momento


        //inserir aluguel no banco de dados
        const originalPrice = gameExists[0].pricePerDay * daysRented;
        const rentDate = dayjs().format('YYYY-MM-DD');
        const returnDate = null;
        const delayFee = null;

        await connection.query(`
            INSERT INTO rentals ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee")
            VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [customerId, gameId, rentDate, daysRented, returnDate, originalPrice, delayFee]
        );

        res.sendStatus(201);

    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }

}

export async function returnRental(req, res){

    try {

    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }

}

export async function deleteRental(req, res){
    
    try {

    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
    
}