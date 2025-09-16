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
let steps = [];
const USERS_FILE = path.join(__dirname, 'users.json');
const STEPS_FILE = path.join(__dirname, 'steps.json');

loadUsers();
loadSteps();

// ENDPOINTS

app.get('/', (req, res) => {
    res.send('Türr Pista - 13.a szoftverfejlesztő lépegetés számláló backend api')
});

// ------------------- USERS --------------------

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


// -------------------- STEPS ---------------

// GET all steps by userId
app.get('/steps/user/:uid', (req, res) => {
    let uid = Number(req.params.uid);
    let idx = users.findIndex(user => user.id == uid)

    if (idx == -1) {
        res.status(400).send({msg: "Nincs ilyen felhasznalo"});
        return;
    }

    res.send(steps.filter(step => step.uid == uid));

    /* let matchSteps = [];
    steps.forEach(step => {
        if (step.uid === uid) {
            matchSteps.push(step);
        }
    });
    res.send(matchSteps); */
});


// GET one step by id

app.get('/steps/:id', (req, res) => {
    let id = req.params.id;
    let idx = steps.findIndex(step => step.id == id);
    if (idx > -1) {
        return res.send(steps[idx]);
    }
    return res.status(400).send({msg: "Nincs ilyen azonosítójú lépésszám!"});
});

// POST new step by uid

app.post('/steps/upload/:uid', (req, res) => {
    let data = req.body;
    let uid = Number(req.params.uid);
    steps.push(data);
    data.id = getNextStepID();
    data.uid = uid;
    saveSteps();
    res.send({msg: 'A lépés felvéve!'});
})

// PATCH step by id
app.patch('/steps/:id', (req, res) => {
    let data = req.body;
    let id = Number(req.params.id);

    let newDate = data.newDate;
    let newCount = Number(data.newCount);

    steps.forEach(step => {
        if (step.id === id) {
            step.date = newDate;
            step.count = newCount;
        }
    });
    saveSteps();
    res.send({msg: 'Sikeres módosítás'})
});


// DELETE step by id
app.delete('/steps/:id', (req, res) => {
    let id = Number(req.params.id);
    let idx = steps.findIndex(step => step.id == id);

    if (idx > -1) {
        steps.splice(idx, 1);
        saveSteps();
        return res.status(200).send({msg: 'Sikeres törlés'})
    }
    return res.status(400).send({msg: "Nincs ilyen azonosítójú lépésszám!"});
})


// DELETE all steps by userId
app.delete('/steps/users/:uid', (req, res) => {
    let uid = Number(req.params.uid);
    let idx = users.findIndex(user => user.id == uid)

    if (idx == -1) {
        res.status(400).send({msg: "Nincs ilyen felhasználó!"});
        return;
    }

    let newSteps = steps.filter(step => step.uid != uid);
    steps = newSteps;

    saveSteps();
    res.send({msg: 'Lépésadatok sikeresen törölve'})
});

app.listen(3000);

function getNextID() {
    const maxId = users.reduce((max, u) => {
        const id = Number(u?.id);
        return Number.isFinite(id) && id > max ? id : max;
    }, 0);
    return maxId + 1;
}

function getNextStepID() {
    const maxId = steps.reduce((max, u) => {
        const id = Number(u?.id);
        return Number.isFinite(id) && id > max ? id : max;
    }, 0);
    return maxId + 1;
}

function loadSteps(){
    if (fs.existsSync(STEPS_FILE)) {
        const raw = fs.readFileSync(STEPS_FILE);
        try {
            steps = JSON.parse(raw);
        } catch (err) {
            console.log('Hiba', error)
            steps = []
        }
    } else {
        saveSteps();
    }
}

function saveSteps() {
    fs.writeFileSync(STEPS_FILE, JSON.stringify(steps));
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