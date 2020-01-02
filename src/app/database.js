import mongoose from 'mongoose';
mongoose.connect(process.env.MONGODB,  { useNewUrlParser: true, useUnifiedTopology: true });

export default{
    "user": mongoose.model('user', new mongoose.Schema({
        name: {
            first: { type: String, default: null },
            last: { type: String, default: null }
         },
        photo: { type: String, default: null },
        email: {
            address: { type: String, default: null },
            verified: { type: Boolean, default: false },
        },
        phone: {
            number: { type: String, default: null },
            code: { type: String, default: null },
            expired: { type: Number, default: 0 },
            verified: { type: Boolean, default: false }
        },
        password: { type: String, default: null },
        permission: { type: String, default: 'user' }
    })),
    "ticket": mongoose.model('ticket', new mongoose.Schema({
        title: { type: String, default: null },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
        strange: { type: Number, default: 0 },
        department: { type: String, default: null },
        createdAt: { type: Date, default: Date.now },
        status: { type: Number, default: 1 }
    })),
    "ticket_message": mongoose.model('ticket_message', new mongoose.Schema({
        content: { type: String, default: null },
        ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'ticket' },
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
        sentAt: { type: Date, default: Date.now }
    })),
    "post": mongoose.model('post', new mongoose.Schema({
        photo: { type: String, default: null },
        title: { type: String, default: null },
        content: { type: String, default: null },
        tags: { type: String, default: null },
    }, {
        timestamps: {
            createdAt: true
        }
    })),
    "internet": mongoose.model('internet', new mongoose.Schema({
        name: { type: String, default: null },
        category: { type: String, default: null },
        speed: { type: Number, default: 0 },
        time: { type: Number, default: 1 },
        volume: {
            in: { type: Number, default: 0 },
            out: { type: Number, default: 0 }
        },
        each: { type: Number, default: 0 },
        price: { type: Number, default: 0 },
        index: { type: Boolean, default: false }
    })),
    "project": mongoose.model('project', new mongoose.Schema({
        name: { type: String, default: null },
        details: { type: String, default: null },
        category: { type: String, default: null },
        url: { type: String, default: null }
    })),
    "faq": mongoose.model('faq', new mongoose.Schema({
        title: { type: String, default: null },
        content: { type: String, default: null },
        star: { type: Boolean, default: false }
    })),
    "bug": mongoose.model('bug', new mongoose.Schema({
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
        project: { type: mongoose.Schema.Types.ObjectId, ref: 'project' },
        content: { type: String, default: null },
        sentAt: { type: Date, default: Date.now }
    })),
    "chat": mongoose.model('chat', new mongoose.Schema({
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
        admin: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
        closed: { type: Boolean, default: false },
    }, {
        timestamps: true
    })),
    "call": mongoose.model('call', new mongoose.Schema({
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
        admin: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
        sdp: { type: String, default: null },
        department: { type: String, default: null }
    }, {
        timestamps: true
    }))
};