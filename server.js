const express = require('express');
const fs = require('fs');
const cors = require('cors');
const { initStore } = require('./utils/store')

const userRoutes = require('./modules/users');
const stepRoutes = require('./modules/steps');

const app = express();

// Middleware-ek
app.use(cors());
app.use(express.json()); // json formatum megkövetelése
app.use(express.urlencoded({extended: true})); // req body-n keresztül átmenjenek az adatok

//initStore();

app.get('/', (req, res) => {
    res.send('Türr Pista - 13.a szoftverfejlesztő lépegetés számláló backend api')
});

app.use('/users', userRoutes);
app.use('/steps', stepRoutes);


app.listen(3000, () => {
    console.log('Server listening on http://localhost:3000');
});
