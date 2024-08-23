import express from 'express';
import morgan from 'morgan';
import cors from 'cors';

const app = express();

app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

//handle student enqueue
app.post('/studentEnqueue', async(req, res) => {
    const student_id = req.body.student_id;
    const company_id = req.body.company_id;

    const students_data = await fetch(`http://queue-student:4004/students`);
    const companies_data = await fetch(`http://queue-company:4003/companies`);

    const students = await students_data.json();
    const companies = await companies_data.json();

    const student = students[student_id];
    const company = companies[company_id];

    student.companies.push(company_id); //add company to currrent students' list of companies
    company.queue.push([student_id, student.current_company === ""]); //add student to queue of the company //
    company.available = company.queue.filter((elem) => elem[1] === true); //filter available students

    try {
        await fetch('http://event-bus:4005/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'StudentQueued',
            data: {
              "student": student,
              "company": company,
            },
          }),
        });
      } catch (err) {
        console.log(`(${process.pid}) Manager Service: ${err}`);
        res.status(500).send({
          status: 'ERROR',
          message: err,
        });
      }

      res.status(201).send({
        "student": student,
        "company": company,
      });

});


//handle student dequeue
app.post('/studentDequeue', async(req, res) => {
    const company_id = req.body.company_id; //company that requests to move queue

    const companies_data = await fetch(`http://queue-company:4003/companies`); // all companies
    const students_data = await fetch(`http://queue-student:4004/students`); //all students


    const companies = await companies_data.json(); //json
    const students = await students_data.json(); //json

    const company = companies[company_id]; //company that wants to move queue
    const student_id_remove = company.current_student; //student to remove

    //if currently assigned
    if(student_id_remove) {
        company.queue = company.queue.filter((elem) => elem[0] !== student_id_remove); //remove student
        company.current_student = "";
        company.available = company.queue.filter((elem) => elem[1] === true);
        const removed = students[student_id_remove];
        removed.current_company = "";
        removed.companies = removed.companies.filter((elem) => elem !== company_id); //remove compan from student list
    }

    //if there are available stuents in queue
    if(company.available.length > 0){
        const s_id = company.available[0][0]; //get first avalable studentt
        company.current_student = s_id; //set this  student as the current
        const new_student = students[s_id];
        new_student.current_company = company_id; //set this company as current
    }

    //only student that has been dequeued => get students companies and make changes in their availabilities only
    //and new student assigned will change s
    //new student and removed student should be passed to event bus 

    try {
        await fetch('http://event-bus:4005/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'StudentDequeued',
            data: {
                "removed_student": students[student_id_remove], 
                "new_assigned": students[company.current_student], 
                "company": company
            },
          }),
        });
      } catch (err) {
        console.log(`(${process.pid}) Manager Service: ${err}`);
        res.status(500).send({
          status: 'ERROR',
          message: err,
        });
      }

      res.status(201).send({
        "removed_student": students[student_id_remove], 
        "new_assigned": students[company.current_student], 
        "company": company
    });
    
});


app.listen(4006, () => {
    console.log('Listening on 4006');
});