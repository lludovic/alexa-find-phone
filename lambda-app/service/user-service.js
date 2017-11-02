import AWS from "aws-sdk";
import bluebird from "bluebird";
import unirest from "unirest";

const userTable = 'alexa-user';


class UserService {

    constructor() {
        AWS.config.setPromisesDependency(bluebird);
        this.dynamodb = new AWS.DynamoDB();
    }

    findUser(userId) {
        console.log(`method=findUser  userId=${userId}`);
        return this.dynamodb.getItem({Key: {"userId": {S: userId}}, TableName: userTable})
            .promise()
            .then(user => {
                console.log('find user :', user);
                return Object.keys(user).length !== 0 ? this.dynamoToJson(user) : null;
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
                "devices": {S: '[]'}
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
        console.log('method=updateUser params=', user);
        const params = {
            TableName: userTable,
            Item: {
                "userId": {S: user.userId},
                "devices": {S: JSON.stringify(user.devices)}
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
        console.log('method=ringPhone params=', phone);

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

    dynamoToJson(user) {
        return Object.assign({}, {userId: user.Item.userId.S}, {devices: JSON.parse(user.Item.devices.S)});
    }

}

export const userService = new UserService();