import dayjs from 'dayjs';
import connection from '../dbStrategy/database.js';
import { rentalSchema } from '../schemas/rentalSchema.js';

export async function getRentals(req, res){ //FALTA O JOIN

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
        const { rows: rentals } = await connection.query(`
            SELECT * FROM rentals`
        );

        res.status(200).send(rentals);

    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}

export async function newRental(req, res){ //FALTA VALIDAR ESTOQUE DE JOGOS

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

        //validar se existem jogos disponíveis no estoque no momento
        const { rows: avaiableGames } = await connection.query(`
            SELECT * FROM rentals
            WHERE "gameId"= $1
            AND "returnDate" IS NULL`,
            [gameId]
        );

        if(avaiableGames.length >= gameExists[0].stockTotal){
            return res.status(400).send('Não há jogos disponíveis em estoque no momento');
        }

        //inserir aluguel no banco de dados com dados extras
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

        const rentalId = req.params.id;

        const { rows: rentalData } = await connection.query(`
            SELECT * FROM rentals
            WHERE id= $1`,
            [rentalId]
        );

        //verifica se o aluguel existe
        if(rentalData.length === 0){
            return res.status(404).send('Aluguel não existe');
        }

        //verifica se o aluguel já foi finalizado
        if(rentalData[0].returnDate){
            return res.status(400).send('Aluguel já finalizado');
        }

        //cálculo dos dias de atraso
        let delayFee = 0;
        const today = dayjs().format('YYYY-MM-DD');
        const DAY_IN_MILI = 1000 * 60 * 60 * 24;
        const daysBetween = (Date.now() - rentalData[0].rentDate.getTime())/(DAY_IN_MILI);
        const daysDelay = daysBetween - rentalData[0].daysRented;

        //caso esteja atrasado, calcula a taxa de atraso
        if(daysDelay > 0){
            const gameId = rentalData[0].gameId;

            const { rows: game } = await connection.query(`
                SELECT "pricePerDay" FROM games
                WHERE id= $1`,
                [gameId]
            );

            delayFee = daysDelay * game[0].pricePerDay;

        }
        
        //update da finalização do aluguel
        await connection.query(`
            UPDATE rentals
            SET "returnDate"= $1,
            "delayFee"= $2
            WHERE id= $3`,
            [today, delayFee, rentalId]
        );

        res.sendStatus(200);

    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }

}

export async function deleteRental(req, res){
    
    try {

        const rentalId = req.params.id;

        const { rows: rentalExists } = await connection.query(`
            SELECT * FROM rentals
            WHERE id= $1`,
            [rentalId]
        );

        //validar se o aluguel existe
        if(rentalExists.length === 0){
            return res.status(404).send('Aluguel não existe');
        }

        //validar se o aluguel já foi finalizado
        if(!rentalExists[0].returnDate){
            return res.status(400).send('Aluguel ainda não foi finalizado');
        }

        //deletar aluguel do banco de dados
        await connection.query(`
            DELETE FROM rentals
            WHERE id= $1`,
            [rentalId]
        );

        res.sendStatus(200);

    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
    
}