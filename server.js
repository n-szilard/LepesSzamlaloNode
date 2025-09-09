const express = require('express');
const fs = require('fs');
const path = require('path');
var cors = require('cors');


const app = express();

// Middleware-ek
app.use(cors());
app.use(express.json()); // json formatum megkövetelése
app.use(express.urlencoded({extended: true})); // req body-n keresztül átmenjenek az adatok

let users = [];
const USERS_FILE = path.join(__dirname, 'users.json');
loadUsers();

// ENDPOINTS

app.get('/', (req, res) => {
  res.send('Türr Pista - 13.a szoftverfejlesztő lépegetés számláló backend api')
});


// GET all users
app.get("/users", (req, res) => {
    res.send(users);
})


// GET one user by id
app.get("/users/:id", (req, res) => {
    let id = req.params.id;
    let idx = users.findIndex(user => user.id == id);
    if (idx > -1) {
        return res.send(users[idx]);
    }
    return res.send("Nincs ilyen azonosítójú felhasználó!");
});

// POST new user
app.post('/users', (req, res) => {
    let data = req.body;
    users.push(data);
    data.id = getNextID();
    saveUsers();
    res.send(users);
});

// DELETE user by id
app.delete('/users/:id', (req, res) => {
    let id = req.params.id;
    let idx = users.findIndex(user => user.id == id);
    if (idx > -1) {
        users.splice(idx, 1);
        saveUsers();
        return res.send("A felhasználó törölve.");
    }
    return res.send("Nincs ilyen azonosítójú felhasználó!")
});

// UPDATE user by id
app.patch('/users/:id', (req, res) => {
    let id = req.params.id;
    let idx = users.findIndex(user => user.id == id);
    let data = req.body;
    if (idx > -1) {
        users[idx] = data;
        users[idx].id = Number(id);
        saveUsers();
        res.send("A felhasználó módosítva")
    }
});

app.listen(3000);

let getNextID = () => {
    let nextID = 1;
    if (users.length == 0) {
        return nextID;
    }

    let maxIndex = 0;
    for (let i = 0; i < users.length; i++) {
        if (users[i].id > users[maxIndex].id) {
            maxIndex = i;
        }
    }

    return users[maxIndex].id + 1;
}


function loadUsers() {
    if (fs.existsSync(USERS_FILE)) {
        const raw = fs.readFileSync(USERS_FILE);
        try {
            users = JSON.parse(raw);
        } catch (error) {
            console.log('Hiba az adatok beolvasása közben', error)
            users = [];
        }
    } else {
        saveUsers();
    }
}

function saveUsers() {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users));
}