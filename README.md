<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

<p align="center">
  A <a href="http://nodejs.org" target="_blank">Node.js</a> job scheduling application built with the <a href="http://nestjs.com" target="_blank">NestJS</a> framework for persistent and reliable task automation.
</p>
<p align="center">
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
  <a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
  <a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
</p>

## Description

Persistent Job Scheduler is a robust task scheduling application built with [NestJS](https://github.com/nestjs/nest) and TypeScript. It leverages PostgreSQL for persistent job storage, ensuring no jobs are lost during server crashes or restarts. The scheduler supports recurring jobs, crash recovery, email notifications, and global error handling for reliable task automation.

## Features

1. **Persistent Scheduling**: Jobs are stored in PostgreSQL, ensuring no jobs are lost on server crash or restart.
2. **Crash Recovery**: On startup, the scheduler automatically picks up and processes any missed or overdue jobs.
3. **Polling Mechanism**: Jobs are executed via a polling loop for reliability and persistence.
4. **Recurring Jobs**: Supports daily and weekly recurring jobs.
5. **Email Notifications**: Sends notification emails when jobs are executed.
6. **Global Error Handling**: All errors are logged and returned in a consistent format.

## API Overview

- **Create Job**: `POST /api/job` - Creates a new job.
- **Get All Jobs**: `GET /api/job` - Retrieves a list of all jobs.
- **Get Job by ID**: `GET /api/job/:id` - Retrieves a specific jic job log by its ID.

## What I Learnt From this Project ?

-How to build a persistent job scheduler that keeps track of jobs in a database, so jobs aren’t lost if the server crashes or restarts.
-How to implement crash recovery by polling the database for missed jobs and processing them after a restart.
-How to send notification emails automatically when jobs are executed.
-How to handle recurring jobs (like daily or weekly notifications).
-How to write clean, maintainable code with proper comments, error handling, and linter fixes.ob by its ID.
- **Delete Job**: `DELETE /api/job/:id` - Deletes a specific job by its ID.
- **Get All Job Logs**: `GET /api/job-log` - Returns a list of all job logs.
- **Get Logs for a Specific Job**: `GET /api/job-log/job/:jobId` - Retrieves logs for a specific job.
- **Get Log by Log ID**: `GET /api/job-log/:id` - Retrieves a specific job log by its ID.

## What I Learnt From this Project ?

-How to build a persistent job scheduler that keeps track of jobs in a database, so jobs aren’t lost if the server crashes or restarts.
-How to implement crash recovery by polling the database for missed jobs and processing them after a restart.
-How to send notification emails automatically when jobs are executed.
-How to handle recurring jobs (like daily or weekly notifications).
-How to write clean, maintainable code with proper comments, error handling, and linter fixes.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
