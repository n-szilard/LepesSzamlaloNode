const express = require('express');
const router = express.Router();

const { users, steps, saveSteps, getNextStepID} = require('../utils/store')

// -------------------- STEPS ---------------

// GET all steps by userId
router.get('/user/:uid', (req, res) => {
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
router.get('/:id', (req, res) => {
    let id = req.params.id;
    let idx = steps.findIndex(step => step.id == id);
    if (idx > -1) {
        return res.send(steps[idx]);
    }
    return res.status(400).send({msg: "Nincs ilyen azonosítójú lépésszám!"});
});

// POST new step by uid
router.post('/upload/:uid', (req, res) => {
    let data = req.body;
    let uid = Number(req.params.uid);
    steps.push(data);
    data.id = getNextStepID();
    data.uid = uid;
    saveSteps();
    res.send({msg: 'A lépés felvéve!'});
})

// PATCH step by id
router.patch('/:id', (req, res) => {
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
router.delete('/:id', (req, res) => {
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
router.delete('/users/:uid', (req, res) => {
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

module.exports = router;