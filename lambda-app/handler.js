import {phoneService} from "./service/phone-service";

function onSessionStarted(sessionStartedRequest, session) {
    console.log(`onSessionStarted requestId=${sessionStartedRequest.requestId}, sessionId=${session.sessionId}`);
}

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
                phoneService.onLaunch(event.request, event.session, callback);
                break;
            case 'IntentRequest' :
                // todo implement here intent when multiple devices
                phoneService.onIntent(event.request, event.session, callback);
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