import models from './models';
import service from './services';
import messages from './messages';

export default {
    'database': (req, res, next)=>{
        if(models[req.params.database] != null){ // Check model exists
            if(req.method == 'POST' || req.method == 'PUT'){ // Some codes for POST/PUT method
                let model = models[req.params.database]; // get all required values
                let data = {}; // all body data
                for(let i in model){ // for all required values
                    if(req.body[model[i]]) { // if value exists
                        data[model[i]] = req.body[model[i]];
                    } else { // else say we need this value
                        return res.status(400).json({ status: false, code: 400, message: messages.require(model[i]) });
                        break;
                    }
                }
                if(req.method == 'PUT' && req.body.id == null){ // if method was PUT to edit a value; we need id of that
                    return res.status(400).json({ status: false, code: 400, message: messages.require('id') }); // say we need id
                } else {
                    let object = { name: req.params.database, data }; // create parsing data
                    if(req.method == 'PUT') object['id'] = req.body.id; // if method was PUT, add id of value to change
                    req.database = object; // make it
                    next(); //exit middleware
                }
            } else if(req.method == 'DELETE'){ // if method was DELETE and want remove a value
                if(req.body.id){ // if id of it exists
                    req.database = { // Make it
                        name: req.params.database,
                        id: req.body.id
                    }; 
                    next(); //exit middleware
                } else { // if no id in method DELETE
                    return res.status(400).json({ status: false, code: 400, message: messages.require('id') });
                }
            } else { // if we have bad method and wasn't PUT POST DELETE
                return res.status(400).json({ status: false, code: 400, message: messages.model.badmethod });
            }
        } else { // database not exists
            return res.status(400).json({ status: false, code: 400, message: messages.model.notexists });
        }
    },
    'auth': (req, res, next) => { // MiddleWare Auth
        let token = req.headers.authorization ||
            req.body.authorization ||
            req.query.token;

        if (!token) {
            return res.status(403).json({ status: false, code: 403, message: messages.require('token') });
        } else if (token.includes('Bearer') == false && token.includes('bearer') == false) {
            return res.status(400).json({ status: false, code: 400, message: messages.auth.badtoken });
        } else {
            token = token.split(' ')[1];
            service.AUTH.AccessToken(token)
                .then(result => {
                    if (result == false) return Promise.reject({ status: false, message: messages.auth.expired, expired: true });
                    else {
                        req.user = {
                            'id': result['id'],
                            'permission': result['permission'],
                            token
                        };                        
                        next();
                    }
                }).catch(error => {
                    try {
                        if (typeof error == 'object') res.json(error);
                        else res.status(500).json({ status: false, code: 500, message: messages.error.internal })
                    } catch (error) {
                        return;
                    }
                })
        }
    },
    'permission': (access = []) => { // MiddleWare Check Permission
        return (req, res, next) => {
            if (access.includes(req.user.permission)) return next();
            else return res.status(403).json({ status: false, code: 403, message: messages.error.forbiden });
        }
    },
}