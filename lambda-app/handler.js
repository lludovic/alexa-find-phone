import {userService} from "./service/user-service";

function onSessionStarted(sessionStartedRequest, session) {
    console.log(`onSessionStarted requestId=${sessionStartedRequest.requestId}, sessionId=${session.sessionId}`);
}

const speechResponse = (cb, message, endSession) => cb(null, {
    version: '1.0',
    sessionAttributes: {},
    response: {
        outputSpeech: {
            type: 'PlainText',
            text: message
        },
        shouldEndSession: endSession
    },
});

const welcomeResponse = (cb, userId) => cb(null, {
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
                smallImageUrl: userService.smallImageUrl(userId),
                largeImageUrl: userService.largeImageUrl(userId)
            }
        },
        shouldEndSession: true
    },
});

const onLaunch = (request, session, callback) => {
    const userId = session.user.userId.replace('amzn1.ask.account.', '');
    userService.findUser(userId)
        .then(user => {

            if (user === null) {
                userService.createUser(userId);
                userService.findUser(userId)
                    .then(result => user = result);
                console.log('user after creation ', user);

            }

            if (user && user.devices.length !== 0) {
                if (user.devices.length === 1) {
                    userService.ringPhone(user.devices[0]);
                    speechResponse(callback, `Your Phone Will ring in a few seconds`, true);
                } else {
                    const phoneNames = user.devices.map(d => d.name).join();
                    speechResponse(callback, `Which phone are you looking for ${phoneNames}`, false);
                }
            } else {
                welcomeResponse(callback, userId);
            }
        });
};

const onIntent = (request, session, callback) => {
    const intent = request.intent;
    switch (intent.name) {
        case 'FindMyPhone':
            //implement intent when multiple phone
            const userId = session.user.userId.replace('amzn1.ask.account.', '');
            userService.findUser(userId)
                .then(user => {
                    if (user) {
                        console.log('intent :', intent);
                        const slotNameValue = intent.slots.name.value.toUpperCase();
                        const device = user.devices.find(device => device.name.toUpperCase() === slotNameValue);
                        if (device) {
                            userService.ringPhone(device);
                            speechResponse(callback, `${device.name} Phone Will ring in a few seconds`, true);
                        } else {
                            speechResponse(callback, `no phone find for ${slotNameValue}`, true);
                        }
                    }
                    else {
                        welcomeResponse(callback, userId);
                    }
                });
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
};


const handle = (event, context, callback) => {
    try {

        //only request from this skill can access lambda
        if (event.session.application.applicationId !== 'amzn1.ask.skill.d5947de0-a32d-418f-9c08-4fb9cfe9f66d') {
            callback('Invalid Application ID');
        }

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        switch (event.request.type) {
            case 'LaunchRequest' :
                // userService.onLaunch(event.request, event.session, callback);
                onLaunch(event.request, event.session, callback);
                break;
            case 'IntentRequest' :
                // todo implement here intent when multiple devices
                // userService.onIntent(event.request, event.session, callback);
                onIntent(event.request, event.session, callback);
                break;
            case 'SessionEndedRequest' :
                callback();
                break;

        }
    } catch (err) {
        callback(err);
    }
};

export {handle};