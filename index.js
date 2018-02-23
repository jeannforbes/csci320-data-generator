const Identity = require('fake-identity');
const ccgen = require('./cc-generator.js');
const idgen = require('unique-id-generator');
const converter = require('json-2-csv');

/* 
 * BASIC SERVER STUFF 
 */
const app = require('express')();
const server = require('http').Server(app);

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => { res.sendFile('index.html', {root: './client'});});
app.get('/style.css', (req, res) => {res.sendFile('style.css', {root:'./client'}); });
app.get('/script.js', (req, res) => {res.sendFile('script.js', {root:'./client'}); });

let books;
let movies;
let customers;
let payments;
let employees;
let stores;

app.get('/books', (req, res) => {
    console.log(req.url);
    let num = parseInt(req.url.split('?')[1]) || 1;
    books = genBooks(num);
    res.write(JSON.stringify(books));
    res.send();
    /*converter.json2csv(genBooks(5), (err, csv) => {
        if(err){
            console.log("Could not convert JSON to CSV: "+err);
            res.write(err);
            res.send();
        } else{
            console.log(csv);
            res.write(csv);
            res.send();
        }
    });*/
});
app.get('/movies', (req, res) => {
    console.log(req.url);
    let num = parseInt(req.url.split('?')[1]) || 1;
    movies = genMovies(num);
    res.write(JSON.stringify(movies));
    res.send();
});
app.get('/customers', (req, res) => {
    console.log(req.url);
    let num = parseInt(req.url.split('?')[1]) || 1;
    customers = genCustomers(num)
    res.write(JSON.stringify(customers));
    res.send();
});
app.get('/payments', (req, res) => {
    console.log(req.url);
    let num = parseInt(req.url.split('?')[1]) || 1;
    payments = genPayments(num);
    res.write(JSON.stringify(payments, customers));
    res.send();
});
app.get('/employees', (req, res) => {
    console.log(req.url);
    let num = parseInt(req.url.split('?')[1]) || 1;
    employees = genEmployees(num, stores);
    res.write(JSON.stringify(employees));
    res.send();
});
app.get('/stores', (req, res) => {
    console.log(req.url);
    let num = parseInt(req.url.split('?')[1]) || 1;
    stores = genStores(num);
    res.write(JSON.stringify(stores));
    res.send();
});

const run = () => {
  server.listen(PORT);
  console.log("Listening on port "+PORT+"...");
};

run();


// CUSTOMER entity set gen
//   num -> number of entities to generate
const genCustomers = (num) => {
    let output = {};
    for(let i=0; i<num; i++){
        let id = Identity.generate();
        let customer = {};
        customer.username = id.firstName[0] +id.lastName; 
        customer.password = 'password123';
        customer.firstName = id.firstName;
        customer.lastName =id.lastName;
        customer.email = id.emailAddress;
        customer.address = id.street+', '+id.city+' '+id.state+' '+id.zipCode;
        customer.phone = id.phoneNumber;
        customer.birthDate = id.dateOfBirth;
        customer.CID = idgen({prefix:'CID-'})
        output[customer.CID] = customer;
    }
    return output;
};

// PAYMENT entity set gen
// (cc_number, cc_expiration, cc_pin, cc_security)
//   num -> number of entities to generate
//   customers -> customers assoc. with payments
const genPayments = (num, customers) => {
    if(!customers) return {};
    const output = {};

    for(let i=0; i<num; i++){
        let key = getRandKey(customers)
        output[key] = {};
        output[key].ccNumber = ccgen.GenCC();
        output[key].ccExpiration = Identity.generate().dateOfBirth;
        output[key].ccPIN = rint()+''+rint()+''+rint()+''+rint();
        output[key].ccSecurity = rint()+''+rint()+''+rint();
    }
    return output;
}

// EMPLOYEE entity set gen
//
const genEmployees = (num, stores) => {
    if(!stores) return {};
    let output = {};
    for(let i=0; i<num; i++){
        let employee = {};
        let id = Identity.generate();
        employee.phone = id.phoneNumber;
        employee.address = id.street+', '+id.city+' '+id.state+' '+id.zipCode;
        employee.firstName = id.firstName
        employee.lastName = id.lastName;
        employee.ESSN = idgen();
        employee.SID = getRandKey(stores);
        output[employee.ESSN] = employee;
    }
    return output;
};

// BOOKS entity set gen
// (ISBN, title, author, yearPublish, cost)
const genBooks = (num) => {
    let output = {};
    for(let i=0; i<num; i++){
        let book = {};
        let id = Identity.generate();
        book.title = 'title123';
        book.author = id.firstName+' '+id.lastName;
        book.yearPublish = id.dateOfBirth.toString().split(' ')[3];
        book.cost = rint()+1;
        book.ISBN = idgen({prefix:'ISBN-'});
        output[book.ISBN] = book;
    }
    return output;
};

// MOVIES
const genMovies = (num) => {
    let output = {};
    for(let i=0; i<num; i++){
        let movie = {};
        let id = Identity.generate();
        movie.title = 'title123';
        movie.director = id.firstName+' '+id.lastName;
        movie.yearRelease = id.dateOfBirth.toString().split(' ')[3];
        movie.cost = rint()+1;
        movie.ISAN = idgen({prefix:'ISAN-'});
        output[movie.ISAN] = movie;
    }
    return output;
};

// STORE
const genStores = (num) => {
    let output = {};
    for(let i=0; i<num; i++){
        let store = {};
        let id = Identity.generate();
        store.address = id.street+', '+id.city+' '+id.state+' '+id.zipCode;
        store.phone = id.phoneNumber;
        store.SID = idgen({prefix:'SID-'});
        output[store.SID] = store;
    }
    return output;
};

// HELPER FUNCTIONS

const rint = () => {
    return parseInt(Math.random()*10);
}

const getRandKey = (dict) => {
    let keys = Object.keys(dict);
    return keys[parseInt(Math.random()*keys.length)];
}

const getRandFromDict = (dict) => {
    let keys = Object.keys(dict);
    return dict[keys[parseInt(Math.random()*keys.length)]];
}