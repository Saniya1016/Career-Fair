import express from 'express';
import { randomBytes } from 'crypto';
import morgan from 'morgan';
import cors from 'cors';
import * as Store from './crud.js';

const app = express();

app.use(express.json());
app.use(morgan('dev'));
app.use(cors());


const filter_check = async(student) => {
  if(student) {
      for(let company_id of student.companies){
          const company =  await Store.readById(company_id);
          const index = company.queue.findIndex((elem) => elem[0] === student.id);
          company.queue[index][1] = (student.current_company === "" || student.current_company === company_id);
          company.available = company.queue.filter((elem) => elem[1] === 'true'); //filter available students
          const updatedCompany = await Store.updateCompany(company.id, company.queue, company.available, company.current_student);
      }
  }
}

app.get('/test', (req, res) => {
    res.send('Hello Company');
});

//get all companies
app.get('/companies', async (req, res) => {
    console.log(`(${process.pid}) Company Service: GET /companies`);
    const companies = await Store.read();
    console.log(`(${process.pid}) Company Service: ${JSON.stringify(companies)}`);
    res.send(companies);
});

//gets all students in queue for company wth id
app.get('/company/:id', async (req, res) => {
    try{
        const id = req.params['id'];
        console.log(`(${process.pid}) Company Service: GET /company`);
        const company = await Store.readById(id);
        console.log(`(${process.pid}) Company Service: ${JSON.stringify(company)}`);
        if(company){
            res.status(200).send(company);
        } else{
            res.status(404).send({});
        }
    } catch{
        res.status(400).send('Bad request in Company Service');
    }
    res.end();
});

//create company 
//add company with id, name and empty students queue to store 
//- make call to event-bus with 'CompanyCreated event type'
app.post('/company', async(req, res) => {
    const id = randomBytes(4).toString('hex');
    const { name } = req.body;

    const company = await Store.createCompany(id, name);
    console.log(`(${process.pid}) Company Service: ${JSON.stringify(company)}`);

    try {
        await fetch('http://event-bus:4005/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'CompanyCreated',
            data: {
              id,
              name,
            },
          }),
        });
      } catch (err) {
        console.log(`(${process.pid}) Company Service: ${err}`);
        res.status(500).send({
          status: 'ERROR',
          message: err,
        });
      }

      res.status(201).send(company);
      console.log(`(${process.pid}) Company Service: ${JSON.stringify(company)}`);
});

//receive event from event-bus
app.post('/events', async (req, res) => {
    const event = req.body;
    const type = event.type;
    const data = event.data;

    console.log(`(${process.pid}) Company Service Received Event: ${type}`);

    if(type === 'StudentQueued'){
        const {student, company} = data;
        const updatedCompany = await Store.updateCompany(company.id, company.queue, company.available, company.current_student);
    }

    if(type === 'StudentDequeued'){
      const {removed_student, new_assigned, company} = data;
      const updatedCompany = await Store.updateCompany(company.id, company.queue, company.available, company.current_student);

      await filter_check(removed_student);
      await filter_check(new_assigned);
    }

    res.send({});
});


app.listen(4001, () => {
    console.log('Listening on port 4001');
});