import unirest from "unirest";
import {phoneService} from "./service/phone-service";

const updatePhone = (event, context, cb) => {
    try {
        console.log('update phone ');
        console.log('body: ', event.body);

        const userId = event.pathParameters.userId;
        phoneService.findUser(userId)
            .then(user => {
                if (user) {
                    phoneService.updateUser(event.body)
                        .then(() => cb(null, {
                            statusCode: 200,
                            headers: {
                                "Access-Control-Allow-Origin": "*", // Required for CORS support to work
                                "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS
                            },
                            body: `user update`,
                        }))
                        .catch(() => cb(null, {
                            statusCode: 404,
                            headers: {
                                "Access-Control-Allow-Origin": "*",
                                "Access-Control-Allow-Credentials": true
                            },
                            body: `user=${userId} not found`,
                        }))
                    ;
                } else {
                    cb(null, {
                        statusCode: 404,
                        headers: {
                            "Access-Control-Allow-Origin": "*",
                            "Access-Control-Allow-Credentials": true
                        },
                        body: `user=${userId} not found`,
                    });
                }
            });
    } catch (err) {
        cb(err);
    }
};

// simple end point to test ring phone when call this lambda via http
const ringPhone = (event, context, cb) => {
    try {
        console.log('ringPhone phone ');
        unirest.post('https://fcm.googleapis.com/fcm/send')
            .headers({
                'Authorization': 'key=AAAAQj2opTg:APA91bHdYYOHHqew18YLWk9dNOOliIjLIRgyy1cRPO0IyCV5LFEhQJUtMEiXBra8ADo82oi1MFP6sBNmeSoUuLnw_HQZah4DzWAGkxieeimf2TIM0Cl0FzV2jp6libzTMep3Is3YXH3G',
                'Content-Type': 'application/json'
            })
            .send({
                "to": "fLxcI1ENAQk:APA91bH6T9LyuP4hhECu7ZNAcfiq7R3Vs_qi2cWoKJyHeP7sQJ9DSqykkMVZueqxEodEf-ejH6pjM9uQVpxnM1n61A-DklUCno9bFGw_BmU4-_kd-Ic7jB5bAGN-OM_yndhLIf03zf2p",
                "priority": "HIGH",
                "data": {
                    "my_custom_key": "my_custom_value"
                }
            })
            .end(function (response) {
                console.log(response.body);
            });
        cb(null, {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true
            },
            body: JSON.stringify({data: "data"}),
        });
    } catch (err) {
        cb(err);
    }
};

export {updatePhone, ringPhone};
