require('dotenv').config();

const express = require('express');
const cors = require('cors');
const Pusher = require('pusher');
const bodyParser = require('body-parser');

const app = express();

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_APP_KEY,
  secret: process.env.PUSHER_APP_SECRET,
  cluster: process.env.PUSHER_APP_CLUSTER
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/pusher/auth', (req, res) => {
  const socketId = req.body.socket_id;
  const channel = req.body.channel_name;
  const presenceData = {
    user_id: 'unique_user_id',
    user_info: {
      name: 'Mr Channels',
      twitter_id: '@pusher'
    }
  };
  const auth = pusher.authenticate(socketId, channel, presenceData);
  console.log('AUTH', auth);
  res.send(auth);
})

app.set('port', 5001);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running → PORT ${server.address().port}`);
});
