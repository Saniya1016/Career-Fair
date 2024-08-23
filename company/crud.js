import { Company } from './database.js';

export async function createCompany(id, name){
    try {
        const newCompany = await Company.create({ _id: id, name: name, queue: [], available: [], current_student: "" });
        const savedCompany = await newCompany.save();
        return savedCompany;
    } catch (error) {
        console.error('Error creating company:', error);
        throw error;
    }
}

export async function read(){
    try{
        const companies = await Company.find();
        console.log("Companies: ", companies);
        return companies;
    } catch(error){
        console.error('Failed to retrieve companies');
        throw error;
    }
}

export async function readById(id){
    try {
        const company = await Company.findById(id);
        
        if (!company) {
            return { error: 'Company not found' };
        }

        return company;
    } catch (error) {
        console.error('Error reading company by ID:', error);
        return { error: 'Internal server error' };
    }
}

export async function updateCompany(id, new_queue, new_available, new_current){
    const updates = {queue: new_queue, available: new_available, current_student: new_current};
    try {
        const updatedCompany = await Company.findByIdAndUpdate(id, updates, {
          new: true
        });
        if (!updatedCompany) {
          console.log('Company not found');
          return null;
        }
        console.log('Company updated successfully:', updatedCompany);
        return updatedCompany;
      } catch (error) {
        console.error('Failed to update company:', error);
        throw error;
      }
}



//----TEST-------//
// await createCompany("1467abc", "Apple");
// await read();
// console.log(await readById("123abc"));
// const c1 = await updateCompany("1467abc", [["youni", false], ["wow12", true]], [["yo", true]], "saniya45");
// console.log(c1);