import connection from "../dbStrategy/database.js";
import { categorySchema } from "../schemas/categorySchema.js";

export async function getCategories(req, res) {

    try {

        //retorna a tabela categorias
        const { rows: categories } = await connection.query('SELECT * FROM categories');

        res.status(200).send(categories);

    } catch(error) {
        console.log(error);
        res.sendStatus(500);
    }
    
}

export async function newCategory(req, res){

    try {

        const category = req.body;

        //validar se os campos foram preenchidos corretamente
        const validName = categorySchema.validate(category);

        if(validName.error){
            return res.status(400).send('Informe o nome da categoria');
        }

        //valida se a categoria já existe
        const nameExists = await connection.query(
            `SELECT * FROM categories 
            WHERE name= $1`, 
            [category.name]
        );

        if(nameExists.rowCount > 0){
            return res.status(409).send('Essa categoria já existe');
        }

        //insere a categoria no banco de dados
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