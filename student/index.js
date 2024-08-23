import express from 'express';
import morgan from 'morgan';
import Store from './store.js';
import cors from 'cors';
import { randomBytes } from 'crypto';

const app = express();

app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

//get all students in store
app.get('/students', (req, res) => {
    console.log(`(${process.pid}) Student Service: GET /students`);
    const students = Store.read();
    console.log(`(${process.pid}) Student Service: ${JSON.stringify(students)}`);
    res.send(students);
});

//get  this student id
app.get('/student/:id', (req, res) => {
    try{
        const id = req.params['id'];
        console.log(`(${process.pid}) Student Service: GET /student`);
        const students = Store.read();
        console.log(`(${process.pid}) Student Service: ${JSON.stringify(students)}`);
        if(students[id]){
            res.status(200).send(students[id]);
        } else{
            res.status(404).send({});
        }
    } catch{
        res.status(400).send('Bad request in Student Service')
    }
    res.end()
});



//create student in store
app.post('/student', async(req, res) => {
    const id = randomBytes(4).toString('hex');
    const { name } = req.body;

    const students = Store.read();
    console.log(`(${process.pid}) Student Service: ${JSON.stringify(students)}`);

    students[id] = { id, name, companies: [] , current_company: ""};
    Store.write(students);

    try {
        await fetch('http://event-bus:4005/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'StudentCreated',
            data: {
              id,
              name,
            },
          }),
        });
      } catch (err) {
        console.log(`(${process.pid}) Student Service: ${err}`);
        res.status(500).send({
          status: 'ERROR',
          message: err,
        });
      }

      res.status(201).send(students[id]);
      console.log(`(${process.pid}) Student Service: ${JSON.stringify(students[id])}`);
});

//for event-bus
app.post('/events', (req, res) => {
    const event = req.body;
    const type = event.type;
    const data = event.data;
    console.log(`(${process.pid}) Students Service Received Event: ${type}`);
    const students = Store.read();

    if(type === 'StudentQueued'){
        const {student, company} = data;
        students[student.id].companies = student.companies; 
    }

    if(type === 'StudentDequeued'){
      const {removed_student, new_assigned, company} = data;
        if(removed_student){
            students[removed_student.id].companies = removed_student.companies;
            students[removed_student.id].current_company = removed_student.current_company;
        }
        if(new_assigned){
            students[new_assigned.id].companies = new_assigned.companies;
            students[new_assigned.id].current_company = new_assigned.current_company;
        }
    }

    Store.write(students);

    res.send({});
});

app.listen(4002, () => {
    console.log('Listening on 4002');
});
