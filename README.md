# Delidock
This repo contains huge part of Delidock ecosystem, containg backend for managing the box and transport of the live video stream.
## Dependencies
- `node >= 18`
- `pnpm`
- `docker`
## Dev cycle
Step by step instructions:
### Installation
In root directory (`delidock/`):
```
pnpm i
```
### Running
To start all services (apps) in `dev` mode, we use [Turbo](https://turbo.build/repo):
```
pnpm turbo dev
```
This will start all servces from `delidock/apps/`.<br>
You can also filter which service do you want to start and which not. Using `--filter` flag:
```
pnpm turbo dev --filter <service>
```
You can also chain these `--filter` flags:
```
pnpm turbo dev  --filter <service1> --filter <service2>
```
#### Services
Service names are specified in each `package.json` of each service.
#### Our list of services:
- `debugger`: Temporary substitution for mobile app in terms of functionality
- `delidock-server`: Main backend for Delidock ecosystem
- `livekit-server`: LiveKit server responsible for the token gen for LiveKit signal server
- `livekit-signal`: LiveKit signaling server
## WIP
Most WIP thing is Mobile app. You can try run the `debugger` as mobile app by building (specified below) and using `tauri` which requires `Rust` and `Android Studio`  installed. In case of ios app is `Xcode` required. <br>Refer to [Official Tauri docs (beta)](https://beta.tauri.app/guides/prerequisites/).
### Android
From `delidock/apps/debugger`, you can run:
```
pnpm tauri android dev
```
It shoudl fire up android emulator.
### IOS
For ios it si:
```
pnpm tauri ios dev
```
But this is not tested at all. Refer to [Official Tauri docs (beta)](https://beta.tauri.app/guides/prerequisites/)

### Production (build)
Production is not ready, but you can still run build scripts of some services. Same as `dev` we use [Turbo](https://turbo.build/repo):
```
pnpm turbo build
```  
You can still use `--filter` flag as in `dev` command.