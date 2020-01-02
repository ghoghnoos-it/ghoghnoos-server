import database from './database';
import messages from './messages';
import service from './services';
import jwt from 'jsonwebtoken';
import md5 from 'md5';

async function newAdmin(req, res){
    let email = req.body.email,
        permission = req.body.permission,
        password = req.body.password;

    if(email == null){
        return res.json({ status: false, message: messages.require('email') });
    } else {
        try {
            let user = await database.user.findOne({ 'email.address': email }).exec();
            if(user == null){
                if(password == null){
                    return res.json({ status: false, message: messages.require('password') });
                } else {
                    user = await new database.user({ 'email.address': email, 'password': await md5(password), permission }).save();
                }
            } else {
                await database.user.updateOne({ 'email.address': email }, { permission }).exec();
            }
            return res.json({ status: true, message: messages.auth.new, id: user._id });
        } catch (error) {
            return res.status(500).json({ status: false, code: 500, message: messages.error.internal });
        }
    }
}

async function login(req, res){
    let email = req.body.email,
        password = req.body.password;

    if(email == null){
        return res.json({ status: false, message: messages.require('email') });
    } else if(password == null){
        return res.json({ status: false, message: messages.require('password') });
    } else {
        try {
            let user = await database.user.findOne({ 'email.address': email }).exec();
            if(user == null){
               return res.json({ status: false, message: messages.auth.notfound });
            } else if(user['password'] != md5(password)){
                return res.json({ status: false, message: messages.auth.badpassword });
            } else {
                let auth = await service.AUTH.generate(user['_id'], user['permission']);
                return res.json({ status: true, message: messages.auth.success, auth, info: user });
            }
        } catch (error) {
            return res.status(500).json({ status: false, code: 500, message: messages.error.internal });
        }
    }
}

async function register(req, res){
    let email = req.body.email,
        password = req.body.password;

    if(email == null){
        return res.json({ status: false, message: messages.require('email') });
    } else if(password == null){
        return res.json({ status: false, message: messages.require('password') });
    } else {
        try {
            let user = await database.user.findOne({ 'email.address': email }).exec();
            if(user == null){
                user = await new database.user({ 'email.address': email, 'password': await md5(password) }).save();
                let auth = await service.AUTH.generate(user['_id'], user['permission']);
                return res.json({ status: true, message: messages.auth.success, auth, info: user });
            } else {
                return res.json({ status: false, message: messages.auth.registerd });
            }
        } catch (error) {
            return res.status(500).json({ status: false, code: 500, message: messages.error.internal });
        }
    }   
}

async function VerifyEmailAccount(req, res){
    let token = req.params.token;
    try {
        let result = await jwt.verify(token, process.env.AUTH_KEY);
        await database.user.updateOne({ _id: result['id'] }, { 'email.verified': true }).exec();
        res.writeHead(302, {'Location': 'https://my.ghoghnoos.co'});
        res.end();
    } catch (error) {
        return res.send(messages.auth.badtoken);
    }
}

function VerifyPhoneAccount(req, res){
    let token = req.body.token;

    if(token == null) return res.json({ status: false, message: messages.require('token') });
    else {
        database.user.findById(req.user.id).exec()
        .then(async result=>{
            if(result['phone']['verified'] == true) return res.json({ status: true, message: messages.auth.phoneVerified });
            else if(token != result['phone']['code']) return res.json({ status: false, message: messages.auth.badcode });
            else if(Date.now() >= result['phone']['expired']) return res.json({ status: false, message: messages.auth.expiredcode });
            else {
                await database.user.updateOne({ _id: req.user.id }, { 'phone.verified': true, 'phone.code': null, 'phone.expired': 0 }).exec();
                return res.json({ status: true, message: messages.auth.phoneVerified });
            }
        }).catch(()=>{
            res.json({ status: false, message: messages.error.internal })
        });
    }
}

async function ForgetPasswordAccount(req, res){
    let token = req.params.token;
    try {
        let result = await jwt.verify(token, process.env.AUTH_KEY);
        await database.user.updateOne({ _id: result['id'] }, { password: result['password'] }).exec();
        res.writeHead(302, {'Location': 'https://my.ghoghnoos.co/account/login'});
        res.end();
    } catch (error) {
        return res.json(messages.auth.badtoken);
    }
}

function reauth(req, res){
    let refresh_token = req.body.refresh_token;

    if (refresh_token == null) return res.json({ status: false, message: messages.require('refresh token') });
    else {
        service.AUTH.RefreshToken(refresh_token)
            .then(auth => {
                if (auth == false) return Promise.reject({ status: false, message: messages.auth.expired, logout: true });
                else return Promise.resolve(auth);
            })
            .then(auth => {
                return database.user.findById(auth['id']).exec();
            })
            .then(async user => {
                if (!user) return Promise.reject({ status: false, message: messages.auth.notfound });
                else {
                    let auth = await service.AUTH.generate(user['_id'], user['permission']);
                    delete user['_id'];
                    delete user['__v'];
                    res.json({ status: true, message: messages.auth.success, auth, info: user });
                    return;
                }
            })
            .catch(error => {
                try {
                    if (typeof error == 'object') res.json(error);
                    else res.json({ status: false, message: messages.error.internal })
                } catch (error) {
                    return;
                }
            })
    }
}

function RequestForEmailVerify(req, res){
    database.user.findById(req.user.id).exec()
    .then(async user=>{
        if(user['verified'] == true) return res.json({ status: true, message: messages.auth.emailVerified });
        else{
            let token = await jwt.sign({id: user['_id']}, process.env.AUTH_KEY);
            let link = `https://api.ghoghnoos.co/account/verify/${token}`;
            service.EMAIL(user['email'], link);
            return res.json({ status: true, message: messages.auth.emailSend });
        }
    }).catch(()=>{
        res.json({ status: false, message: messages.error.internal })
    });
}

function RequestForPhoneVerify(req, res){
    let phone = req.body.phone;
    if(phone == null) return res.json({ status: false, message: messages.require('phone') });
    else {
        database.user.findById(req.user.id).exec()
        .then(async user=>{
            if(user['phone']['verified'] == true) return res.json({ status: true, message: messages.auth.phoneVerified });
            else if(user['phone']['code'] != null && Date.now() < user['phone']['expired']) return res.json({ status: false, message: messages.auth.hascode });
            else {
                let code = Math.floor(Math.random() * (99999 - 10000 + 1) ) + 10000;
                let expired = Date.now() + 180000;
                await service.SMS(user['phone']['number'], code);
                await database.user.updateOne({ _id: req.user.id }, { 'phone.number': phone, 'phone.code': code, 'phone.expired': expired }).exec();
                return res.json({ status: true, message: messages.auth.smsSend, expired });
            }
        }).catch(()=>{
            res.json({ status: false, message: messages.error.internal })
        });
    }
}

async function RequestForForgetPassword(req, res){
    let email = req.body.email,
        password = req.body.password;

    if(email == null){
        return res.json({ status: false, message: messages.require('email') });
    } else if(password == null){
        return res.json({ status: false, message: messages.require('password') });
    } else {
        try {
            let user = await database.user.findOne({ email }).exec();
            if(user == null){
               return res.json({ status: false, message: messages.auth.notfound });
            } else {
                let token = await jwt.sign({ id: user['_id'], password: await md5(password)}, process.env.AUTH_KEY, { expiresIn: 900000 });
                let link = `https://api.ghoghnoos.co/account/forget/${token}`;
                service.EMAIL(email, link);
                return res.json({ status: true, message: messages.auth.send});
            }
        } catch (error){
            return res.json({ status: false, message: messages.error.internal });
        }
    }
}

function me(req, res){
    database.user.findById(req.user.id).select("name photo phone email verified permission").exec()
    .then(data=>{
        return res.json({ status: true, data })
    }).catch(() => res.json({ status: false, message: messages.error.internal }))
}

function edit(req, res){
    let object = req.body;
    delete object['permission'];
    delete object['verified'];
    delete object['_id'];
    delete object['email'];
    if(object['password']) object['password'] = md5(object['password']);
    database.user.updateOne({ _id: req.user.id }, object).exec().then(()=>{
        return res.json({ status: true, message: messages.database.updated });
    }).catch(() => res.json({ status: false, message: messages.error.internal }))
}

function getUserTickets(req, res){
    database.ticket.find({ 'user': req.user.id }).exec()
        .then(data => {
            return res.json({ status: true, data });
        }).catch(() => res.json({ status: false, message: messages.error.internal }));
}

function createUserTicket(req, res){
    if(!req.body.ticket) return res.json({ status: false, message: messages.require('ticket') });
    else if(!req.body.ticket.title) return res.json({ status: false, message: messages.require('title') });
    else if(!req.body.message) return res.json({ status: false, message: messages.require('message') });
    else if(!req.body.message.content) return res.json({ status: false, message: messages.require('content') });
    else {
        new database.ticket({ 'title': req.body.ticket['title'], 'strange': req.body.ticket['strange'] , 'department': req.body.ticket['department'], 'user': req.user.id }).save()
            .then(ticket => {
                return new database.ticket_message({ 'ticket': ticket['_id'], content: req.body.message['content'], 'sender': req.user.id }).save();
            }).then(() => {
                res.json({ status: true, message: messages.ticket.created });
            }).catch(() => res.json({ status: false, message: messages.error.internal }));
    }
}

function getAllTicketsByStatusForAdmin(req, res){
    let status = req.params.status;
    if (status != "0" && status != "1" && status != "2") return res.json({ status: false, message: messages.ticket.badstatus })
    else {
        database.ticket.find({ status: parseInt(status) }).exec()
            .then(data => {
                return res.json({ status: true, data });
            }).catch(() => res.json({ status: false, message: messages.error.internal }));
    }
}

function getAllTicketMessages(req, res){
    let id = req.params.ticket;
    database.ticket_message.find({ ticket: id }).populate("sender", "permission").populate("ticket").exec()
        .then(data => {
            return res.json({ status: true, data });
        }).catch(() => res.json({ status: false, message: messages.error.internal }));
}

function addTicketMessage(req, res){
    let id = req.params.ticket,
        content = req.body.content;
    if (content == null) return res.json({ status: false, message: message.require('content') })
    else {
        database.ticket.findOne({ '_id': id }).exec()
            .then(result => {
                if (result == null) return Promise.reject({ status: false, message: messages.ticket.notexists })
                else return Promise.resolve()
            }).then(() => {
                new database.ticket_message({ 'ticket': id, content: content, 'sender': req.user.id }).save();
            })
            .then(() => {
                return database.ticket.updateOne({ '_id': id }, { status: req.user.permission != 'user' ? 2 : 1 }).exec();
            })
            .then(() => {
                res.json({ status: true, message: messages.ticket.added });
            }).catch(error => {
                try {
                    if (typeof error == 'object') res.json(error);
                    else res.json({ status: false, message: messages.error.internal })
                } catch (error) {
                    return;
                }
            })
    }
}

function closeTicket(req, res){
    let id = req.params.ticket;
    database.ticket.updateOne({ '_id': id }, { status: 0 }).exec()
        .then(result => {
            return res.json({ status: true, message: messages.ticket.closed })
        }).catch(() => res.json({ status: false, message: messages.error.internal }));
}

async function sendBug(req, res){
    let project = req.body.project,
        content = req.body.content;

    if(!project) return res.json({ status: false, message: messages.require('project') });
    else if(!content) return res.json({ status: false, message: messages.require('content') });
    else {
        try {
            let result = await database.project.findById(project).exec();
            if(result == null) return res.json({ status: false, message: messages.bug.projectnotfound });
            else {
                await new database.bug({ sender: req.user.id, project: result['_id'], content }).save();
                return res.json({ status: true, message: messages.bug.submited });
            }
        } catch (error) {
            return res.json({ status: false, message: messages.error.internal });
        }  
    }
}

function getBugs(req, res){
    if(req.user.permission == 'user') {
        database.bug.find({ sender: req.user.id }).populate('project', 'name').exec()
        .then(data=>{
            return res.json({ status: true, data });
        }).catch(()=>{
            return res.status(500).json({ status: false, code: 500, message: messages.error.internal });
        })
    } else {
        database.bug.find({}).populate('project', 'name').populate('sender', 'name email').exec()
        .then(data=>{
            return res.json({ status: true, data });
        }).catch(()=>{
            return res.status(500).json({ status: false, code: 500, message: messages.error.internal });
        })
    }
}



function create(req, res){
    new database[req.database.name](req.database.data).save()
    .then(result=>{
        return res.json({ status: true, message: messages.database.created, id: result._id });
    }).catch(()=>{
        return res.status(500).json({ status: false, code: 500, message: messages.error.internal });
    })
}

function update(req, res){
    database[req.database.name].updateOne({ _id: req.database.id }, req.database.data).exec()
    .then(()=>{
        return res.json({ status: true, message: messages.database.updated });
    }).catch(()=>{
        return res.status(500).json({ status: false, code: 500, message: messages.error.internal });
    })
}

function remove(req, res){
    database[req.database.name].remove({ "_id": req.database.id }).exec()
    .then(()=>{
        return res.json({ status: true, message: messages.database.removed });
    }).catch(error=>{        
        return res.status(500).json({ status: false, code: 500, message: messages.error.internal });
    })
}

function GraphGetAll(name='', filter={}, page=0){
    if(page != -1){
        return database[name].find(filter).skip(page * 10).limit(10).exec();
    } else {
        return database[name].find(filter).exec();
    }
}

function GrapghGetOne(name='', filter={}){
    return database[name].findOne(filter).exec();
}

export default { 
    'graph': { 'getAll': GraphGetAll, 'getOne': GrapghGetOne },
    'account': { me, edit, login, register, reauth, VerifyEmailAccount, VerifyPhoneAccount, RequestForEmailVerify, RequestForPhoneVerify, newAdmin, RequestForForgetPassword, ForgetPasswordAccount }, 
    'ticket': { getUserTickets, createUserTicket, getAllTicketsByStatusForAdmin, getAllTicketMessages, addTicketMessage, closeTicket },
    'bug': { sendBug, getBugs },
    create, update, remove
};