const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(__dirname, '..', 'database', 'users.json');
const STEPS_FILE = path.join(__dirname, '..', 'database', 'steps.json');

let users = [];
let steps = [];

function initStore() {
    loadUsers();
    loadSteps();
}

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

initStore();

module.exports = {
    initStore,
    saveUsers,
    saveSteps,
    getNextID,
    getNextStepID,
    isEmailExists,
    users,
    steps
}