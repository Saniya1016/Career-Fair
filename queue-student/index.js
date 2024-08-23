import express from 'express';
import morgan from 'morgan';
import Store from'./store.js';

const app = express();

app.use(express.json());
app.use(morgan('dev'));


app.get('/students', (req, res) => {
    console.log(`(${process.pid}) Student-Queue Service: GET /students`);
    const students = Store.read();
    console.log(`(${process.pid}) Student-Queue Service: ${JSON.stringify(students)}`);
    res.send(students);
});

app.post('/events', (req, res) => {
    const { type, data } = req.body;
    const students = Store.read();

    if(type === 'StudentCreated'){
        const {id, name} = data;
        students[id] = {id, companies:[], current_company: ""};
    }

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

    res.send({ status: 'OK' });
});

app.listen(4004, () => {
    console.log('Listening oon 4004');
});