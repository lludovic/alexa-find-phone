import AWS from "aws-sdk";
import bluebird from "bluebird";
import unirest from "unirest";

const userTable = 'alexa-user';


class PhoneService {

    constructor() {
        AWS.config.setPromisesDependency(bluebird);
        this.dynamodb = new AWS.DynamoDB();
    }

    onLaunch(request, session, callback) {
        const userId = session.user.userId.replace('amzn1.ask.account.', '');
        this.findUser(userId)
            .then(user => {

                if (user == null) {
                    this.createUser(userId);
                    this.findUser(userId)
                        .then(result => user = result);
                    console.log('user after creation ', user);

                }

                if (user && user.devices.length !== 0) {
                    console.log(`fcm server key : `, process.env.fcmAuthorizationKey);

                    this.ringPhone(user.devices[0]);

                    callback(null, {
                        version: '1.0',
                        sessionAttributes: {},
                        response: {
                            outputSpeech: {
                                type: 'PlainText',
                                text: `Your Phone Will ring in a few seconds`
                            },
                            shouldEndSession: true
                        },
                    });
                } else {

                    callback(null, {
                        version: '1.0',
                        sessionAttributes: {},
                        response: {
                            outputSpeech: {
                                type: 'PlainText',
                                text: `Download App find Phone and \nRegister Your phone before continue`
                            },
                            card: {
                                type: 'Standard',
                                title: 'Find Phone',
                                text: `Download App MyPhone on PlayStore \n Register your phone with userId : ${userId}`,
                                image: {
                                    smallImageUrl: this.smallImageUrl(userId),
                                    largeImageUrl: this.largeImageUrl(userId)
                                }
                            },
                            shouldEndSession: true
                        },
                    });
                }
            });
    }

    onIntent(request, session, callback) {
        const intent = request.intent;
        switch (intent.name) {
            case 'FindPhoneIntent':
                //implement intent when multiple phone
                break;
            case 'AMAZON.HelpIntent':
                //todo implement help intent
                callback();
                break;
            case 'AMAZON.StopIntent':
            case 'AMAZON.CancelIntent':
                callback();
                break;
            default :
                throw new Error('Invalid intent');
                break;
        }
    }

    findUser(userId) {
        console.log(`method=findUser  userId=${userId}`);
        return this.dynamodb.getItem({Key: {"userId": {S: userId}}, TableName: userTable})
            .promise()
            .then(user => {
                return Object.keys(user).length !== 0 ? this.dynamoToSimpleJson(user) : null;
            })
            .catch(err => {
                console.log('error ', err);
                new Error('Invalid intent');
            });
    }

    createUser(userId) {
        console.log(`method=createUser  userId=${userId}`);
        const params = {
            TableName: userTable,
            Item: {
                "userId": {S: userId},
                "devices": {L: []}
            }
        };

        return this.dynamodb.putItem(params)
            .promise()
            .then(user => user)
            .catch(err => {
                console.log('error ', err);
                new Error('Invalid intent');
            });
    }

    updateUser(user) {
        console.log('method=updateUser  user=', JSON.parse(user));
        user = JSON.parse(user);

        //todo, save field devices as String
        const params = {
            TableName: userTable,
            Item: {
                "userId": {S: user.userId},
                "devices": {
                    L: user.devices.map(d => {
                        return {M: {"name": {S: d.name}, "token": {S: d.token}}};
                    })
                }
            }
        };

        return this.dynamodb.putItem(params)
            .promise()
            .then(user => user)
            .catch(err => {
                console.log('error ', err);
                new Error('Invalid intent');
            });
    }

    ringPhone(phone) {
        console.log('method=ringPhone ', phone);

        unirest.post('https://fcm.googleapis.com/fcm/send')
            .headers({
                'Authorization': 'key=' + process.env.fcmAuthorizationKey,
                'Content-Type': 'application/json'
            })
            .send({
                "to": phone.token,
                "priority": "HIGH",
                "data": {
                    "phone": "ring phone"
                }
            })
            .end(function (response) {
                console.log(response.body);
            });
    }

    //generate Qrcode from googleapi service
    smallImageUrl(userId) {
        return `https://chart.googleapis.com/chart?chs=480x480&cht=qr&chl=${userId}`;
    }

    //generate Qrcode from googleapi service
    largeImageUrl(userId) {
        return `https://chart.googleapis.com/chart?chs=500x500&cht=qr&chl=${userId}`;
    }

    dynamoToSimpleJson(user) {
        return Object.assign({}, {userId: user.Item.userId.S}, {
            devices: user.Item.devices.L.map(d => {
                return {name: d.M.name.S, token: d.M.token.S};
            })
        });
    }

}

export const phoneService = new PhoneService();