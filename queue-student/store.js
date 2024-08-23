//Stores all info about a student => [ {id: "", companies: {}, current_company: 'company_id'}, .... ]
import fs from 'fs';

const read = () => {
  if (fs.existsSync('queue-student.json')) {
    return JSON.parse(fs.readFileSync('queue-student.json', 'utf8'));
  } else {
    return {};
  }
};

const write = (student) => {
  fs.writeFileSync('queue-student.json', JSON.stringify(student));
};

export default {
  read,
  write,
};
