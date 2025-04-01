require('dotenv').config()
const pg = require('pg')
const client = new pg.Client(process.env.DATABASE_URL)
const express = require('express')
const app = express()

app.use(require('morgan')('dev'))
app.use(express.json())

// READ
app.get('/api/flavors', async (req, res, next) => {
    try {
        const SQL = `SELECT * FROM flavors ORDER BY created_at DESC`;
        const response = await client.query(SQL)
        res.send(response.rows)
    } catch (error) {
        next(error)
    }
})

// READ 1
app.get('/api/flavors/:id', async (req, res, next) => {
    try {
        const SQL = `SELECT * FROM flavors WHERE id=$1`
        const response = await client.query(SQL, [req.params.id])
        res.send(response.rows[0])
    } catch (error) {
        next(error)
    }
})

// CREATE
app.post('/api/flavors', async (req, res, next) => {
    try {
        const SQL = `INSERT INTO flavors(name, is_favorite) VALUES($1, $2) RETURNING *`;
        const response = await client.query(SQL, [req.body.name, req.body.is_favorite])
        res.status(201).send(response.rows)
    } catch (error) {
        next(error)
    }
})

// UPDATE
app.put('/api/flavors/:id', async (req, res, next) => {
    try {
        const SQL = `UPDATE flavors SET name=$1, is_favorite=$2, updated_at=now() WHERE id=$3 RETURNING *`;
        const response = await client.query(SQL, [req.body.name, req.body.is_favorite, req.params.id])
        res.send(response.rows[0])
    } catch (error) {
        next(error)
    }
})

// DELETE
app.delete('/api/flavors/:id', async (req, res, next) => {
    try {
        const SQL = `DELETE FROM flavors WHERE id=$1`;
        const response = await client.query(SQL, [req.params.id])
        res.sendStatus(204)
    } catch (error) {
        next(error)
    }
})

const init = async () => {
    await client.connect()

    let SQL = /* sql */ `
    DROP TABLE IF EXISTS flavors;
    CREATE TABLE flavors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        is_favorite BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
    )
    `;
    await client.query(SQL)

    SQL = /* sql */ `
    INSERT INTO flavors(name) VALUES('vanilla');
    INSERT INTO flavors(name) VALUES('chocolate');
    INSERT INTO flavors(name) VALUES('strawberry');
    INSERT INTO flavors(name, is_favorite) VALUES('cookie dough', true);
    INSERT INTO flavors(name) VALUES('mint');
    INSERT INTO flavors(name) VALUES('rocky road');
    `;
    await client.query(SQL)

    const port = process.env.PORT
    app.listen(port, () => console.log(`listening on ${port}`));
}

init();