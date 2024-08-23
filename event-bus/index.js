import express from 'express';
import morgan from 'morgan';

const app = express();

app.use(express.json());
app.use(morgan('dev'));

// const servicePorts = [4001, 4002, 4003, 4004];
const servicePorts = [{name: 'company', port: 4001}, 
                      {name: 'student' , port: 4002}, 
                      {name:'queue-company', port: 4003}, 
                      {name: 'queue-student', port: 4004},
                    ];

app.post('/events', async(req, res) => {
    const event = req.body;
    
    console.log(`(${process.pid}) Event Bus (Received Event) ${event.type}`);

    for (const {name, port} of servicePorts) {
        try {
        console.log(
            `(${process.pid}) Event Bus (Sending Event to ${port}) ${event.type}`
        );

        await fetch(`http://${name}:${port}/events`, {
            method: 'POST',
            body: JSON.stringify(event),
            headers: { 'Content-Type': 'application/json' },
        });
        } catch (err) {
            console.log(err);
        }
    }

    res.send({ status: 'OK' });
});

app.listen(4005, () => {
    console.log('Listening on 4005');
});