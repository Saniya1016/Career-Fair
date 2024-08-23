//require mongoose module
import mongoose from 'mongoose';

//get the uri from MongoDB
const uri = "mongodb+srv://saniyasingh:oWJfok7lOy9A1WBs@company-db.yawpdw2.mongodb.net/";

//setup Database connection handle any errors
async function connect(){
    try{
        await mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});
        console.log("connected to MongoDB");
    } catch(error){
        console.error(error);
    }
}

//connect to Database
connect();

//Define Score Schema for the game
const companySchema = new mongoose.Schema(
    { 
        _id: String, 
        name: String, 
        queue: [[String, Boolean]], 
        available: [[String, Boolean]], 
        current_student: String
    }
);

//Define Score model
const Company = mongoose.model('Company', companySchema);

//create collection of model
Company.createCollection().then(function (collection){
    console.log("Collection for company is created");    
});

export {Company};