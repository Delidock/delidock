// server.js
import bodyParser from 'body-parser';
import express from 'express';
import { AccessToken } from 'livekit-server-sdk';

const createToken = (name) => {

  const roomName = 'quickstart-room';

  const participantName = name;

  const at = new AccessToken('devkey', 'secret', {
    identity: participantName,
  });
  at.addGrant({ roomJoin: true, room: roomName });

  return at.toJwt();
}

const app = express();
const port = 4000;

app.use(bodyParser.text())
app.post('/getToken', (req, res) => {
  res.send(createToken(req.body));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})