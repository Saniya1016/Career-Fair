import express from 'express';
import Store from './store.js';
import morgan from 'morgan';

const app = express();

app.use(express.json());
app.use(morgan('dev'));


//function to filter availabilities in the companies
const filter_check = (student, companies) => {
    if(student){
        for(let company_id of student.companies){
            const company =  companies[company_id];
            const index = company.queue.findIndex((elem) => elem[0] === student.id);
            company.queue[index][1] = (student.current_company === "" || student.current_company === company_id);
            company.available = company.queue.filter((elem) => elem[1] === true); //filter available students
        }
    }
}

//get all companies in the database
app.get('/companies', (req, res) => {
    console.log(`(${process.pid}) Company-Queue Service: GET /companies`);
    const companies = Store.read();
    console.log(`(${process.pid}) Company-Queue Service: ${JSON.stringify(companies)}`);
    res.send(companies);
});


//receive events from event-bus
app.post('/events', (req, res) => {
    const { type, data } = req.body;
    const companies = Store.read();

    //create new company
    if(type === 'CompanyCreated'){
        const {id, name} = data;
        companies[id] = {id, queue:[], available:[], current_student: ""};
    }

    //add student to queue of company with given id
    if(type === 'StudentQueued'){
        const {student, company} = data;
        companies[company.id].queue = company.queue;
        companies[company.id].available = company.available;
    }

    //remove current student so next studdent can be in meeting
    if(type === 'StudentDequeued'){

        const {removed_student, new_assigned, company} = data;
        companies[company.id].queue = company.queue;
        companies[company.id].available = company.available;
        companies[company.id].current_student = company.current_student;

        filter_check(removed_student, companies);
        filter_check(new_assigned, companies);

    }
    Store.write(companies);
    res.send({ status: 'OK' });
});

app.listen(4003, () => {
    console.log('Listening on 4003');
});