<p align="center">
  <a href="https://github.com/filoscoder/fe-kiddo">
    <img width="250px" src="https://user-images.githubusercontent.com/50701501/104827248-f88a1800-585b-11eb-985e-5e31dbb0b913.jpg"><br/>
  </a>
</p>
<p align="center">
  <a href="https://lerna.js.org/"><img src="https://img.shields.io/badge/PRs-Welcome-brightgreen.svg" alt="Maintained with Lerna"></a>
  <a href="/LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License"></a>
</p>

# Overview

**TEN stack** is a Typescript + Express + Node starter kit for REST API server apps.

---

## Installation

- Fork & Clone [this](https://github.com/filoscoder/ts-node-express-server/fork) repository.
- Install the dependencies with `yarn` or `npm`.

> Make sure you already have `nodejs`, `npm` or `yarn` installed in your system.

- Set your `git remote origin` path

```bash
 git remote add origin ${forked-and-cloned-path}
```

## Configuration

- Copy `.env.example` a file at the root of the application.
- Add or modify specific variables and update it according to your need.

```bash
 cp .env.example .env
```

## Local Development

Run the server locally. It will be run with Nodemon and ready to serve on port `8080` (unless you specify it on your `.env`)

```bash
 yarn start # or npm start
```

## Production

First, build the application.

```bash
 yarn build # or npm run build
```

Then, use [`pm2`](https://github.com/Unitech/pm2) to start the application as a service.

```bash
 yarn service:start # or npm run service:start
```

## Contributing

This repository will be managed as an `open-source`. <br>
Please feel free to open an `issue` or a `pull request` to suggest changes or additions.

## Support & Contact

If you have any question or suggestion, don't hesitate to contact me:

✉️ [filoscoder.io@gmail.com](mailto:filoscoder.io@gmail.com)


## Author & Credits
<a src="https://github.com/filoscoder">
<img width="60px" style="border-radius: 50%;" src="https://avatars.githubusercontent.com/filoscoder">
</a>
