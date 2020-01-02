import redis from 'redis';
import database from './database';
import message from './messages';
const messages = redis.createClient({ db: process.env.REDIS_MESSAGE });

export default function(io, socket){    
    if(socket.decoded_token.permission != 'user') { // If wasn't a user
        socket.join('admins');
    }
    
    socket.on('room', ()=>{
        database.chat.findOne({ user: socket.decoded_token.id, closed: false }).exec()
        .then(res=>{
            if(res == null) socket.emit('on-room', null);
            else socket.emit('on-room', res['_id']);
        });
    });

    socket.on('new-room', ()=>{
        if(socket.decoded_token.permission == 'user'){
            let id = socket.decoded_token.id;

            new database.chat({ user: id }).save()
            .then(chat=>{
                socket.join(chat['_id']);
                socket.emit('on-new-room', JSON.stringify({ _id: chat['_id'], message: message.chat.created }));
                io.to('admins').emit('on-new-room');
            });
        }
    });

    socket.on('get-room', ()=>{
        if(socket.decoded_token.permission != 'user'){
            database.chat.find({ closed: false, admin: { $in: [null, socket.decoded_token.id] } }).populate('user', 'name email').populate('admin', 'name').exec()
            .then(data=>{
                io.to('admins').emit('on-get-room', data);
            });
        }
    });

    socket.on('get-message', id=>{
        if(!id) return;
        socket.join(id);
        messages.get(id+'-messages', (error, result)=>{
            if(error || !result) socket.emit('on-get-message', []);
            else {
                let data = [];
                result = result.split('-MESSAGE-');                
                for(let i in result){
                    try {
                        data.push(JSON.parse(result[i]));
                    } catch (error) {
                        
                    }
                }
                socket.emit('on-get-message', data);
            }
        });
    });

    socket.on('room-message', data => {
        // -MESSAGE-{content: '', user: true/false, sentAt: Date.now()}
        let msg = JSON.stringify({ content: data.message, user: socket.decoded_token.permission == 'user', sentAt: Date.now() });
        messages.append(data['id'] + '-messages', '-MESSAGE-' + msg);
        io.to(data['id']).emit('on-room-message', msg);
    });

    socket.on('join-room', id => {
        if(socket.decoded_token.permission != 'user'){            
            database.chat.findById(id).exec()
            .then(result=>{
                if(result['admin'] == null || result['admin'] == socket.decoded_token.id){
                    if(result['admin'] == null) database.chat.updateOne({ _id: id }, { admin: socket.decoded_token.id }).exec();
                    socket.join(id);
                    socket.emit('on-join-room', id);
                    io.to('admins').emit('on-joined-room', id);
                } else {
                    socket.emit('on-join-room', false);
                }
            })
        } else {
            socket.emit('on-join-room', false);
        }
    });

    socket.on('close-room', id=>{        
        database.chat.updateOne({ _id: id }, { closed: true }).exec();
        messages.del(id);
        messages.del(id+'-messages');
        io.to(id).emit('on-closed-room', true);
    });

    socket.on('new-call', data=>{        
        if(socket.decoded_token.permission == 'user'){
            let id = socket.decoded_token.id;

            new database.call({ 'user': id, 'sdp': JSON.stringify(data['sdp']) }).save()
            .then(call=>{
                socket.join(call['_id']);
                io.to('admins').emit('on-new-call', {id: call['_id'], sdp: data['sdp']});
            });
        }
    });

    socket.on('join-call', data=>{
        if(socket.decoded_token.permission != 'user'){            
            let id = data['id'];
            database.call.findById(id).exec()
            .then(result=>{
                if(result['admin'] == null || result['admin'] == socket.decoded_token.id){
                    if(result['admin'] == null) database.call.updateOne({ _id: id }, { admin: socket.decoded_token.id }).exec();
                    socket.join(id);
                    io.to(id).emit('on-join-anwer', data['sdp']); // send admin sdp to user
                    socket.emit('on-join-call', result['sdp']); // send user sdp to admin
                    io.to('admins').emit('on-joined-call', id);
                } else {
                    socket.emit('on-join-call', false);
                }
            })
        } else {
            socket.emit('on-join-call', false);
        }
    });
}