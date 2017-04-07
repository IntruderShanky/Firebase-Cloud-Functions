let functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);


//HTTP Function
exports.helloWorld = functions.https.onRequest((request, response) => {
    response.send("Hello World");
});


//EVENT TRIGGER
exports.sendNotification = functions.database.ref('/data').onWrite(event => {
    const snapshot = event.data;

    const text = snapshot.val().message;
    console.log("message:", text);

    const payload = {
        notification: {
            title: `Title ${text}`,
            body: text ? (text.length <= 100 ? text : text.substring(0, 97) + '...') : ''
        }
    };

    //Get the list of device tokens.
    return admin.database().ref('token').once('value').then(token => {
        console.log("token", token.val());
        return admin.messaging()
            .sendToDevice(
                token.val(), payload)
            .then(response => {
                console.log("results", response.results)
            })
            .catch(error =>{
                console.log("ERROR OCCURRED: ", error)
            });
    });
});
