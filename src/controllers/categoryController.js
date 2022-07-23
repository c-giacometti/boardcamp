import connection from "../dbStrategy/database.js";

export async function getCategories(req, res) {

    try {

        const { row: categories } = await connection.query('SELECT * FROM categories');

        res.send(categories).status(200);

    } catch(error) {
        console.log(error);
        res.sendStatus(500);
    }
}

export async function newCategory(req, res){

}