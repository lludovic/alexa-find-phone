export class Utils {

    buildResponse(sessionAttributes, response) {
        return {
            version: '1.0',
            sessionAttributes,
            response: response,
        };
    }

    buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
        return {
            outputSpeech: {
                type: 'PlainText',
                text: output,
            },
            card: {
                type: 'Simple',
                title: `SessionSpeechlet - ${title}`,
                content: `SessionSpeechlet - ${output}`,
            },
            reprompt: {
                outputSpeech: {
                    type: 'PlainText',
                    text: repromptText,
                },
            },
            shouldEndSession,
        };
    }

    buildResponseForObject(response) {
        return {
            version: '1.0',
            sessionAttributes: response.sessionAttributes,
            response: response.speechletResponse,
        };
    }
}

// export default Utils