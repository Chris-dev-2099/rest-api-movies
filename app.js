import express, { json } from 'express';
import { moviesRouter } from './routes/movies.js';
import { corsMiddleware } from './middlewares/cors.js';

// import movies from './movies.json' with { type: 'json'} // <-- Experimental

// Leer un json en ESModules
// import fs from 'node:fs';
// const movies = JSON.parse(fs.readFileSync('./movies.json', 'utf-8'));

// Leer un json en ESModules: (recomendado por ahora)

const app = express();
app.disable('x-powered-by');

app.use(json()); // Middleware transforma informacion body a json
app.use(corsMiddleware());
app.use('/movies', moviesRouter)

const PORT = process.env.PORT ?? 1234

app.listen(PORT, () => {
    console.log(`listening on port http://localhost:${PORT}`);
})

