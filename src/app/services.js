import jwt from 'jsonwebtoken';
import request from 'request';
import Nodemailer from 'nodemailer';

const nodemailer = Nodemailer.createTransport({
    host: '0.0.0.0',
    port: 25,
    auth: {
        user: 'email',
        pass: 'NOORI_1990'
    },
    tls: {
        rejectUnauthorized: false
    }
});

export default {
    AUTH: {
        generate: async function (id = '', permission = '') {
            if (!typeof data == String) return { status: false, message: 'Wrong data.' };
            else {
                let data = { id, permission };
                let access_token = await jwt.sign(data, process.env.AUTH_KEY, { expiresIn: process.env.AUTH_TOKEN_EXPIRE });
                let refresh_token = await jwt.sign(data, process.env.AUTH_KEY, { expiresIn: process.env.AUTH_TOKEN_EXPIRE * 24 });

                let object = new Object();
                object['token_type'] = "bearer";
                object['access_token'] = access_token;
                object['expires_in'] = process.env.AUTH_TOKEN_EXPIRE;
                object['refresh_token'] = refresh_token;

                return object;
            }
        },
        AccessToken: async function (token = '') {
            try {
                let data = await jwt.verify(token, process.env.AUTH_KEY);
                return data;
            } catch (error) {
                return false;
            }
        },
        RefreshToken: async function (token = '') {
            try {
                let data = await jwt.verify(token, process.env.AUTH_KEY);
                return data;
            } catch (error) {
                return false;
            }
        }
    },
    EMAIL: (to='', link='')=>{
        nodemailer.sendMail({
            from: 'email@ghoghnoos.co',
            to: to,
            subject: 'تایید حساب کاربری',
            text: link,
            sender: 'ققنوس مِیل'
        });
        return;
    },
    SMS: (to='', code='')=>{
        request.post({
            url: 'http://ippanel.com/api/select',
            body: {
                "op":"pattern",
                "user":"09127146009",
                "pass":"5090017891",
                "fromNum":"10009589",
                "toNum": to,
                "patternCode":"t77yj38q1u",
                "inputData":[
                    { "code": code },
                ]
            },
            json: true
        })
    }
}