const express = require('express'); // -> npm install express -E
const cors = require('cors');
const crypto = require('node:crypto');
const movies = require('./movies.json');
const { validateMovie, validatePartialMovie } = require('./schemas/movies');

const app = express();
app.disable('x-powered-by');

const PORT = process.env.PORT ?? 1234

app.use(express.json()); // Middleware que transforma la informacion del body en un json

app.use(cors({
    origin: (origin, callback) => {
        const ACCEPTED_ORIGINS = [
            'http://127.0.0.1:5500',
            'http://localhost:8080',
            'http://localhost:1234',
            'http://movies.com',
            'http://kurys.dev',
        ]
        if (ACCEPTED_ORIGINS.includes(origin)){
            return callback(null, true)
        }

        if (!origin){
            return callback(null, true)
        }

        return callback(new Error('Not allowed by CORS'))
    }
}));

// Todos los recursos que sean MOVIES se identifican con  /movies
app.get('/movies', (req, res) => {
    const { genre } = req.query;
    if (genre){
        const filterMovies = movies.filter(
            movie => movie.genre.some( g => g.toLowerCase() === genre.toLowerCase())
        )
        return res.json(filterMovies);
    }
    res.json(movies)
})

app.get('/movies/:id', (req, res) => { 
    const { id } = req.params;
    const movie = movies.find(movie => movie.id === id);
    if (movie) return res.json(movie);

    res.status(404).json({message: 'Movie not found'});
})

app.post('/movies', (req, res) => {
    const result = validateMovie(req.body);

    if (result.error){
        // 422 Unprocessable Entity
        return res.status(400).json({
            error: JSON.parse(result.error.message)
        });
    }

    // En base de datos
    const newMovie = {
        id: crypto.randomUUID(),
        ...result.data
    }

    // Esto no sería rest porue se esta guardando 
    // el estado de la aplicación en memoria
    movies.push(newMovie);
    res.status(201).json(newMovie);

})

app.patch('/movies/:id', (req, res) => {
    const result = validatePartialMovie(req.body);

    if (result.error){
        return res.status(400).json({
            error: JSON.parse(result.error.message)
        });
    }
    
    const { id } = req.params;
    const movieIndex = movies.findIndex(movie => movie.id === id);

    if (movieIndex == -1) return res.status(404).json({ message: 'Movie not found' });

    const updateMovie = {
        ...movies[movieIndex],
        ...result.data
    }

    movies[movieIndex] = updateMovie;

    return res.json(updateMovie);

})

app.delete('/movies/:id', (req, res) => {
    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id);
    if (movieIndex == -1) {
        res.status(404).json({ message: 'Movie not found' }); 
    }

    movies.splice(movieIndex, 1);

    return res.json({ message: 'Movie deleted'});

})

app.listen(PORT, () => {
    console.log('listening on port http://localhost:1234');
})

