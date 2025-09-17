const express = require('express');
const router = express.Router();

const {users, isEmailExists, getNextID, saveUsers} = require('../utils/store')

// ------------------- USERS --------------------

// GET all users
router.get("/", (req, res) => {
    res.send(users);
})

// UPDATE user password
router.patch('/passmod', (req, res) => {
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
router.patch('/profile', (req, res) => {
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
router.get("/:id", (req, res) => {
    let id = req.params.id;
    let idx = users.findIndex(user => user.id == id);
    if (idx > -1) {
        return res.send(users[idx]);
    }
    return res.status(400).send({msg: "Nincs ilyen azonosítójú felhasználó!"});
});

// POST new user
router.post('/', (req, res) => {
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
router.delete('/:id', (req, res) => {
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
router.patch('/:id', (req, res) => {
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
router.post('/login', (req, res) => {
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

module.exports = router;