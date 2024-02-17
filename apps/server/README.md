# Server
API of the Delidock ecosystem, using Livekit as tool for getting live view of the camera in the app
To set up propperly, set these **enviromental variables**:
- DELIDOCK_API_PORT=3000 - port which will be used for the server
- DELIDOCK_API_SECRET="someSecretKey54" - key which will be used for JWT encryption
- LIVEKIT_API_KEY="apiKey" - your livekit server api key
- LIVEKIT_SECRET="secret" - your livekit secret
For more information about Livekit see [official Livekit documentation](https://docs.livekit.io/)