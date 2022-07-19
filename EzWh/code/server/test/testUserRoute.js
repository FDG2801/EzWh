const chai = require('chai');
const chaiHttp = require('chai-http');
const DBHandler = require('../modules/DBHandler');
const UserDAO = require('../modules/userDAO');
chai.use(chaiHttp);
chai.should();
chai.expect();
const userHandler=new UserDAO('EzWh.db')
const app = require('../server');
var agent = chai.request.agent(app);

describe('Test POST new user',()=>{
    testAddNewUser(201,"FrancescoA@gmailla1.com","Francesco","Di Gangi","password","user");
})

describe('TEST PUT MODIFY USER',()=>{
    testModifyRights(200,"FrancescoA@gmailla1.com","user","supplier")
})

describe('TEST DELETE USER',async ()=>{
    await userHandler.newUser("a@a.it","test","a-test","testpassword","none")
    testDeleteUser(204,"a@a.it","none")
})

function testAddNewUser(expectedStatus,username,name,surname,password,type){
    it('should add a new user to the db',function(done) {
        if(username!==undefined){
            console.log('lo username non è undefined')
            let user={username: username, name: name, surname: surname, password: password, type:type}
            agent.post('/api/newUser/')
            .send(user)
            .then(function(res){
                res.should.have.status(expectedStatus);
                res.body.username.should.equal(username);
                done();
            }).catch(done);
        }
        else{
            agent.post('/api/newUser/') //not sending data
            .then(function(res){
                res.should.have.status(expectedStatus);
                done();
            }).catch(done);
        }
    });
}

function testModifyRights(expectedStatus,username,oldType,newType){
    it('should modify the rights of an existing user',function(done){
        if(username!==undefined){
            let rights={username:username,oldType:oldType,newType:newType}
            agent.put(`/api/users/${username}/`)
            .send(rights)
            .then(function(res){
                res.should.have.status(expectedStatus);
                done();
            }).catch(done);
        }
        else{
            agent.put(`/api/users/${username}/`) //not sending data
            .then(function(res){
                res.should.have.status(expectedStatus);
                done();
            }).catch(done);
        }
    })
}

function testDeleteUser(expectedStatus,username,type){
    it('should delete an existing user',function(done){
        if(username!==undefined || (type!==undefined)){
            let deleteThis={username:username,type:type}
            agent.delete(`/api/users/${username}/${type}`)
            .then(function(res){
                console.log(res.status)
                res.should.have.status(expectedStatus);
                done();
            }).catch(done);
        }
        else{
            agent.put(`/api/users/${username}/${type}`) //not sending data
            .then(function(res){
                res.should.have.status(expectedStatus);
                done();
            }).catch(done);
        }
    })
}