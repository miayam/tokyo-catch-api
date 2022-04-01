# Tokyo Catch API
The boring mock API to redeem weekly rewards

## Table of Contents
- [Introduction](#introduction)
- [Requirement](#requirement)
- [Development](#development)
- [Special Thanks](#special-thanks)

## Introduction

This boring mock API is built with [`Express.js`](https://expressjs.com/). The maintainer of this repo keeps the number of dependencies to a minimum. We only need `node-cache` to store response in-memory, `jest` for test suites, and `supertest` to mock API request. 

## Requirement
You only need the latest (or decent) version of `Node.js` installed in your machine. That's it.

## Development
Install all dependencies:

```sh
$ npm install
```

After that, run this command:

```sh
$ npm run start
```

To test them all, run this command:

```sh
$ npm run test
```

## Special Thanks
- [MDN Web Docs](https://developer.mozilla.org/en-US/)
- [Zell Liew's article](https://css-tricks.com/everything-you-need-to-know-about-date-in-javascript/)
- [StackOverflow](https://stackoverflow.com/questions/25260818/rest-with-express-js-nested-router)