const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');


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

// UPDATE user password
app.patch('/users/passmod', (req, res) => {
    console.log(req.body)
    let {id, oldPassword, newPassword} = req.body;
    let idx = users.findIndex(user => user.id == id);
    if (idx === -1) {
        return res.status(400).send({msg: "Nincs ilyen azonosítójú felhasználó!"});
    }
    if (users[idx].password !== oldPassword) {
        return res.status(400).send({msg: "A régi jelszó nem egyezik!"});
    }
    users[idx].password = newPassword;
    saveUsers();
    res.send({msg: "A jelszó sikeresen módosítva!"});
});

// UPDATE user email and name
app.patch('/users/profile', (req, res) => {
    let {id, email, name} = req.body;
    let idx = users.findIndex(user => user.id == id);
    if (idx === -1) {
        return res.status(400).send({msg: "Nincs ilyen azonosítójú felhasználó!"});
    }

    if (email !== users[idx].email) {
        if (isEmailExists(email)) {
            return res.status(400).send({msg: 'Ez az email cím már regisztrálva van.'});
        }
        users[idx].email = email;
    }

    if (name) {
        users[idx].name = name;
    }

    saveUsers();
    res.send({msg: "A felhasználó módosítva"});
});

// GET one user by id
app.get("/users/:id", (req, res) => {
    let id = req.params.id;
    let idx = users.findIndex(user => user.id == id);
    if (idx > -1) {
        return res.send(users[idx]);
    }
    return res.status(400).send({msg: "Nincs ilyen azonosítójú felhasználó!"});
});

// POST new user
app.post('/users', (req, res) => {
    let data = req.body;
    if (isEmailExists(data.email)) {
        return res.status(400).send({msg: 'Ez az email cím már regisztrálva van.'})
    }
    users.push(data);
    data.id = getNextID();
    saveUsers();
    res.send({msg: 'A felhasználó regisztrálva!'});
});

// DELETE user by id
app.delete('/users/:id', (req, res) => {
    let id = req.params.id;
    let idx = users.findIndex(user => user.id == id);
    if (idx > -1) {
        users.splice(idx, 1);
        saveUsers();
        return res.send({msg: "A felhasználó törölve."});
    }
    return res.status(400).send({msg: "Nincs ilyen azonosítójú felhasználó!"})
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
        res.send({msg: "A felhasználó módosítva"})
    }
});

// POST check user login
app.post('/users/login', (req, res) => {
    let { email, password } = req.body;
    let loggedUser = {};
    users.forEach(user => {
        if (user.email == email && user.password == password) {
            loggedUser = user;
            return;
        }
    });
    res.send(loggedUser);
});

app.listen(3000);

function getNextID() {
    const maxId = users.reduce((max, u) => {
        const id = Number(u?.id);
        return Number.isFinite(id) && id > max ? id : max;
    }, 0);
    return maxId + 1;
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


function isEmailExists(email) {
    let exists = false;
    users.forEach(user => {
        if (user.email == email) {
            exists = true;
            return exists;
        }
    });
    return exists;
}