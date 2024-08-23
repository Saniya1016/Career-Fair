//Stores all info about a company => [ {id: "", students:{queue: [], available:[]}, current_student: 'student_id'}, .... ]
import fs from 'fs';

const read = () => {
  if (fs.existsSync('queue-company.json')) {
    return JSON.parse(fs.readFileSync('queue-company.json', 'utf8'));
  } else {
    return {};
  }
};

const write = (company) => {
  fs.writeFileSync('queue-company.json', JSON.stringify(company));
};

export default {
  read,
  write,
};
