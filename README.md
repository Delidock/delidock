# Delidock
This repo is huge part of Delidock ecosystem, containg backend for managing the box and transport of the live video stream.
### See also [box application](https://github.com/Delidock/delidock-box-electron) for the physical box
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
pnpm turbo dev --filter <service1> --filter <service2>
```
### Services
Service names are specified in each `package.json` of each service.
##### Our list of services:
- `debugger`: Temporary substitution for mobile app in terms of functionality (NOT MAINTAINED ANYMORE)
- `client` : Mobile app frontend
- `server`: Main backend for Delidock ecosystem
### Packages
Our system also uses some **shared packages** needed for some **services**. You can find them at `delidock/packages`
#### Our list of packages:
- `types` : Typescript type declarations for **client** and **server**
### Android
We are using [Capacitor](https://capacitorjs.com/) so for enviroment setup, refer to [official documentation](https://capacitorjs.com/docs/getting-started/environment-setup).
From `delidock/apps/client`, you can run:
```
pnpm android
```
It shoudl fire up android emulator, if everyting is set up.
### IOS
For ios it si:
```
pnpm exec cap run ios
```
But this is not tested at all. Refer to [official Capacitor docs](https://capacitorjs.com/docs/getting-started/environment-setup)

### Build
```
pnpm turbo build
```  
You can still use `--filter` flag as in `dev` command.
```
