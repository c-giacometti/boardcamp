import connection from "../dbStrategy/database.js";
import { categorySchema } from "../schemas/categorySchema.js";

export async function getCategories(req, res) {

    try {

        const { rows: categories } = await connection.query('SELECT * FROM categories');

        res.send(categories).status(200);

    } catch(error) {
        console.log(error);
        res.sendStatus(500);
    }
    
}

export async function newCategory(req, res){

    try {

        const category = req.body;

        const validName = categorySchema.validate(category);

        if(validName.error){
            return res.status(400).send('Informe o nome da categoria');
        }

        const nameExists = await connection.query(
            `SELECT * FROM categories 
            WHERE name= $1`, 
            [category.name]
        );

        if(nameExists.rowCount > 0){
            return res.send('Essa categoria já existe').status(400);
        }

        await connection.query(
            `INSERT INTO categories (name)
            VALUES ( $1 )`, 
            [category.name]
        );

        res.sendStatus(201);


    } catch(error) {
        console.log(error);
        res.sendStatus(500);
    }

}