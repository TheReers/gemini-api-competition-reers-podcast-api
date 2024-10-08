# Reers Podcast API For the Gemini API Challenge

## Description
This is an API that allows users to create, read and delete podcasts using the Gemini API.

The image below shows the architecture of the API

![Architecture](./images/architecture-diagram.png)

## Installation Guide
### Prerequisites
- Node.js
- MongoDB
- Docker

### Steps to run this project locally:
To run this project locally, follow the steps below:
1. Run `npm i` command.
2. Add your env variables to `.env` file, look at `.env.sample` file for reference.
3. Run `npm run build` to compile the project.
4. Run `npm lint` to lint the project.
5. Run `npm test` to run the test.
6. Run `npm run build:watch` to compile the project in watch mode.
7. Run `npm run dev` to run the server in watch mode.
8. Run `npm start` command  to start the server.

You need to have a database instance to run this project as it uses mongodb to connect to a database, you can also run the server by running `docker-compose up` which will create a docker container for MongoDB then run the instance in a container.

Built by [Reers Engineering](https://www.reers.tech) with [TypeScript](https://www.typescriptlang.org/), [MongoDB](https://www.mongodb.com/) and[Express](https://expressjs.com/).
