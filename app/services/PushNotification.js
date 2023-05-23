/****************************
 PUSH NOTIFICATIONS OPERATIONS
 ****************************/
var apn = require('apn');
let path = require('path');
let fs = require('fs');
let FCM = require('fcm-node');
let _ = require("lodash");

// Set up apn with the APNs Auth Key
var apnProvider = new apn.Provider({
    token: {
        key: fs.readFileSync(path.resolve(__dirname + '/../../configs/P8Apns.p8')),
        keyId: 'G52Y9AZWL6', // The Key ID of the p8 file (available at https://developer.apple.com/account/ios/certificate/key)
        teamId: '98S2S23DLB', // The Team ID of your Apple Developer Account (available at https://developer.apple.com/account/#/membership/)
    },
    production: false // Set to true if sending a notification to a production iOS app
});

class PushNotification {

    constructor() {
    }

    // Send push notification
    static send(data) {
        return new Promise(async (resolve, reject) => {
            try {
                var note = new apn.Notification();
                note.expiry = Math.floor(Date.now() / 1000) + 7200; // Expires 1 hour from now.
                note.badge = data.badge;
                note.sound = "ping.aiff";
                note.alert = {
                    title: data.title,
                    body: data.message
                };
                note.topic = 'com.theweekendedition.quickee';
                note.mutableContent = 1;
                note.payload = {
                    "data": {
                        "type": data.type,
                        "postId": data.postId,
                        "firstName": data.firstName,
                        "lastName": data.lastName
                    }
                };

                note.aps['content-available'] = 1;
                if (data.type == 'following') {
                    note.payload.data.userId = data.userId
                }
                let deviceToken = data.deviceToken;

                apnProvider.send(note, deviceToken).then((success) => {
                    if (success) {
                        console.log("from success", success.failed)
                        return resolve(success);
                    }
                });
            } catch (err) {
                console.log("Push Notification error", err);
                return reject({ message: err, status: 0 });
            }
        });
    }

    static sendAndroid(data) {
        return new Promise((resolve, reject) => {
            try {
                var serverKey = 'AAAA_eOA8VM:APA91bEeYePc0j0QaF92qj7RaS_x2U2V0fGfHmB7kRyrwkuD05rCzTldOaP6kCt5F0JN9zCe8MNc0oCVqwJfVcn0BL-LHf-WWkx8fTAxHzxALbqKxPVAMW2_VqWYVEo9Pej8zEr1Aq3i'; //put your server key here
                var fcm = new FCM(serverKey);

                var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
                    to: data.deviceToken,
                    collapse_key: 'AIzaSyBfTByKokfpC99MFGAtSjqDTsPla_iwewE',

                    notification: {
                        title: data.title,
                        body: data.message
                    },
                    data: {  //you can send only notification or only data(or include both)
                        data: data
                    }
                };
                console.log(message);
                fcm.send(message, (err, response) => {
                    if (err) {
                        console.log("Something has gone wrong!", err);
                        return reject(err);
                    } else {
                        console.log("Successfully sent with response: ", response);
                        return resolve(response);
                    }
                });
            } catch (error) {
                return reject(error);
            }
        })
    }
}

module.exports = PushNotification;