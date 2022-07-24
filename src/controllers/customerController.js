import connection from '../dbStrategy/database.js';
import { customerSchema } from '../schemas/customerSchema.js';

export async function getCustomers(req, res){

    try {

        const { cpf } = req.query;

        if(cpf){
            const { rows: customers } = await connection.query(`
                SELECT * FROM customers
                WHERE cpf 
                ILIKE $1 || '%'`,
                [cpf]
            );

            res.status(200).send(customers);

        } else {

            const { rows: customers } = await connection.query(`SELECT * FROM customers`);

            res.status(200).send(customers);

        }

    } catch(error) {

        console.log(error);
        res.sendStatus(500);

    }
    
}

export async function getCustomerById(req, res){

    try {

        const { id } = req.params;

        const { rows: customer } = await connection.query(`
            SELECT * FROM customers
            WHERE id= $1`,
            [id]
        );

        if(customer.length === 0){
            return res.status(404).send('Usuário não encontrado');
        }

        res.status(200).send(customer);

    } catch(error) {

        console.log(error);
        res.sendStatus(500);

    }

}

export async function newCustomer(req, res){

    try {

        const customerData = req.body;
        const { name, phone, cpf, birthday } = customerData;

        //valida se os dados têm formato válido
        const validCustomer = customerSchema.validate(customerData);

        if(validCustomer.error){
            return res.status(409).send('Dados incompletos ou incorretos');
        }

        //valida se o cpf já está cadastrado
        const invalidCpf = await connection.query(`
            SELECT * FROM customers
            WHERE cpf= $1`,
            [cpf]
        );

        if(invalidCpf.rowCount > 0){
            return res.status(409).send('Cliente já cadastrado');
        }

        //Insere o cliente no banco de dados
        await connection.query(`
            INSERT INTO customers (name, phone, cpf, birthday)
            VALUES ($1, $2, $3, $4)`,
            [name, phone, cpf, birthday]
        );

        res.sendStatus(201);

    } catch(error) {

        console.log(error);
        res.sendStatus(500);

    }

}

export async function updateCustomer(req, res){
    
    try {

        const customerData = req.body;
        const { name, phone, cpf, birthday } = customerData;
        const { id } = req.params;

        //valida se os dados têm formato válido
        const validData = customerSchema.validate(customerData);

        if(validData.error){
            return res.status(400).send('Dados incorretos ou incompletos');
        }

        const { rows: validCpf } = await connection.query(`
            SELECT * FROM customers
            WHERE cpf= $1`,
            [cpf]
        );

        if(validCpf.length > 0 && validCpf[0].id != id){
            return res.status(409).send('cpf já cadastrado');
        }

        await connection.query(`
            UPDATE customers
            SET name = $1,
            phone = $2,
            cpf = $3,
            birthday = $4
            WHERE id= $5`,
            [name, phone, cpf, birthday, id]
        );

        res.sendStatus(200);

    } catch(error) {

        console.log(error);
        res.sendStatus(500);

    }

}