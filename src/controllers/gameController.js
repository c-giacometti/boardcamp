import connection from '../dbStrategy/database.js';
import { gameSchema } from '../schemas/gameSchema.js';

export async function newGame(req, res){

    try {

    const game = req.body;
    const { name, image, stockTotal, categoryId, pricePerDay } = game;
    
    //validar se os campos foram preenchidos corretamente
    const validGame = gameSchema.validate(game);

    if(validGame.error){
        return res.status(400).send('Valor inválido');
    }

    //validar se categoria existe
    const categoryExists = await connection.query(`
        SELECT * FROM categories
        WHERE id= $1`,
        [categoryId]        
    );

    if(categoryExists.rowCount === 0){
        return res.status(400).send('Categoria não existente');
    }

    //validar se já existe um jogo com o nome
    const gameExists = await connection.query(`
        SELECT * FROM games
        WHERE name= $1`,
        [name]
    );

    if(gameExists.rowCount > 0){
       return res.status(409).send('Esse jogo já existe');
    }

    //inserir jogo no banco de dados
    await connection.query(`
        INSERT INTO games (name, image, "stockTotal", "categoryId", "pricePerDay")
        VALUES ($1, $2, $3, $4, $5)`,
        [name, image, stockTotal, categoryId, pricePerDay]
    );

    res.sendStatus(201);

    } catch(error){

        console.log(error);
        res.sendStatus(500);

    }

}

export async function getGames(req, res){

    try {
        const filter = req.query.name;

        if(filter){
            const { rows: games } = await connection.query(`
                SELECT games.*, categories.name as "categoryName" FROM games
                JOIN categories
                ON games."categoryId" = categories.id
                WHERE games.name
                ILIKE $1 || '%'`,
                [filter]
            );
        
            return res.status(201).send(games);
            
        } else {
            const { rows: games } = await connection.query(`
                SELECT games.*, categories.name as "categoryName" FROM games
                JOIN categories
                ON games."categoryId" = categories.id`
            );
        
            return res.status(201).send(games);
        }

    } catch(error){
        console.log(error);
        res.sendStatus(500);
    }
    
}