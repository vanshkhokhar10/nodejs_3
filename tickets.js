const express = require('express');
const app = express();

app.use(express.json());

const PORT = 3000;

let seats = {
    1: { status: 'available' },
    2: { status: 'available' },
    3: { status: 'available' },
    4: { status: 'available' },
    5: { status: 'available' },
};

const lockTimeouts = {};

app.get('/seats', (req, res) => {
    res.status(200).json(seats);
});

app.post('/lock/:id', (req, res) => {
    const seatId = req.params.id;

    if (!seats[seatId]) {
        return res.status(404).json({ message: 'Seat not found' });
    }

    if (seats[seatId].status === 'booked') {
        return res.status(400).json({ message: 'Seat already booked' });
    }

    if (seats[seatId].status === 'locked') {
        return res.status(400).json({ message: 'Seat is already locked' });
    }

    seats[seatId].status = 'locked';

    lockTimeouts[seatId] = setTimeout(() => {
        if (seats[seatId].status === 'locked') {
            seats[seatId].status = 'available';
        }
    }, 60000);

    return res.status(200).json({
        message: `Seat ${seatId} locked successfully. Confirm within 1 minute.`,
    });
});

app.post('/confirm/:id', (req, res) => {
    const seatId = req.params.id;

    if (!seats[seatId]) {
        return res.status(404).json({ message: 'Seat not found' });
    }

    if (seats[seatId].status !== 'locked') {
        return res.status(400).json({
            message: 'Seat is not locked and cannot be booked',
        });
    }

    seats[seatId].status = 'booked';

    if (lockTimeouts[seatId]) {
        clearTimeout(lockTimeouts[seatId]);
        delete lockTimeouts[seatId];
    }

    return res.status(200).json({
        message: `Seat ${seatId} booked successfully!`,
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
