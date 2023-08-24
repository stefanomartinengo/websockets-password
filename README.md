# react-node-websockets-demo
A simple collaborative document editing app built with React and Node

## How to run the app?

```bash
#-- Setup and start the server
cd server
npm install # or yarn install
npm start # or yarn start

#-- Setup and start the client
cd client
npm install # or yarn install
npm start # or yarn start
```

## License
[MIT](LICENSE)


## Changelog

This project has the following changes compared to the original project.

- Upgraded the React version to 18
- Refactored the client app using multiple functional components
- Refactored the server app using multiple functions and handlers
- Used better dependencies and implementations (i.e., `ws` instead of `websocket`, `uuid` instead of `Math.random`, etc.)
- Used the `react-use-websocket` hook/library instead of directly using the inbuilt WebSockets browser API.
- Fixed several bugs
