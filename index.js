const options = require('./config');
const OBSWebSocket = require('obs-websocket-js');
const socketio = require('socket.io-client')(options.ccServer);
const obs = new OBSWebSocket();

let lastCaption = {speaker: {id: "none"}};

obs.connect(options.obsSettings).then(() => {
    console.log("Connected to OBS");
})

socketio.on('connect', function () {
    console.log("Connected to CC Service")
    socketio.emit('auth', {token: options.ccToken});
})

socketio.on('user-assignment', (data) => {
    console.log("Authorized with CC Service as "+data.user.name);
})

socketio.on('caption', (caption) => {
    if (caption.sent && !caption.cancelled && caption.status) {
        if (lastCaption.speaker.id !== caption.speaker.id) {
            caption.caption = caption.speaker.name+": "+caption.caption
        }
        console.log(caption.caption)
        obs.send("SendCaptions", { text: caption.caption })
        lastCaption = caption;
    }
})