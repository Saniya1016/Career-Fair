//Stores all info about a student => [ {id: "", name: "", companies: {}, current_company: 'company_id'}, .... ]
import fs from 'fs';

const read = () => {
  if (fs.existsSync('student.json')) {
    return JSON.parse(fs.readFileSync('student.json', 'utf8'));
  } else {
    return {};
  }
};

const write = (student) => {
  fs.writeFileSync('student.json', JSON.stringify(student));
};

export default {
  read,
  write,
};
