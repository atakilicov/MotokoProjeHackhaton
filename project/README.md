# Hello, world!

![Hello, world!](/examples/_attachments/hello_world.png)

Start developing on the Internet Computer with “Hello, world!”. Learn how entire applications composed of frontend, backend, and data storage, are built using smart contracts.

- [Overview](#overview)
- [What is Hello, world?](#what-is-hello-world)
  - [How it works](#how-it-works)
  - [Project structure](#project-structure)
- [What you'll learn](#what-youll-learn)
  - [Query calls](#query-calls)
  - [Onchain frontend](#onchain-frontend)
- [Continue building locally](#continue-building-locally)
- [Learn more](#learn-more)

## Overview

In this example, you will deploy a simple "Hello, world!" application to the Internet Computer (ICP). This simple example demonstrates how applications on ICP are structured using a backend smart contract and a frontend smart contract, and provides an introduction to the programming language Motoko.

## What is Hello, world?

"Hello, world!" projects are a common starting point for developers learning new languages or platforms, as it provides a simple demonstration of how a programming language can be written for an application.

### How it works

This variation of "Hello, world!" is written in [Motoko](https://internetcomputer.org/docs/current/motoko/main/getting-started/motoko-introduction),a programming language designed specifically for developing smart contracts on ICP. Smart contracts on ICP are called **canisters.** Motoko strives to be a simple and useful language for ICP canisters that uses a familiar syntax to other languages such as JavaScript, Rust, Swift, or Java.

Every ICP canister must be [compiled into WebAssembly](https://internetcomputer.org/docs/current/developer-docs/smart-contracts/compile) before it can be deployed. Motoko's compiler supports compiling to Wasm directly under the hood. It offers seamless integration for ICP features and makes the most out of WebAssembly's functionalities.

### Project structure

The `/backend` folder contains the Motoko canister, `main.mo`.

The `/frontend` folder contains web assets for the application's user interface. The user interface is written using the React framework.

Edit the `mops.toml` file to add [Motoko dependencies](https://mops.one/) to the project.

## What you'll learn

### Query calls

In this "Hello, world!" example, the Motoko canister exposes a `query` method that can be called to return a "Hello, #name!" message to the user. [Query calls](https://internetcomputer.org/docs/current/developer-docs/smart-contracts/call/overview#query-calls) are used to return data from a canister, and their response is not validated by consensus.

### Onchain frontend

ICP is the only blockchain that can serve web assets (HTML, CSS, JS, and others) from the blockchain to your web browser. To host these assets, a canister implements a method that accepts and consumes an HTTP request, then returns the web assets in the HTTP response.

In this example, the React frontend is compiled into an [asset canister](https://internetcomputer.org/docs/current/developer-docs/web-apps/application-frontends/overview) and deployed to ICP.

To communicate with the backend canister, it uses the [ICP JavaScript agent](https://internetcomputer.org/docs/current/developer-docs/developer-tools/off-chain/agents/javascript-agent).

## Continue building with locally

To migrate your ICP Ninja project off of the web browser and develop it locally, follow these steps.

### 1. Download your project from ICP Ninja using the 'Download files' button.

![ICP Ninja download](/examples/_attachments/icp_ninja_download_files.png)

### 2. Open the `BUILD.md` file for further instructions.

The `BUILD.md` file included in your download will provide information about using `dfx`.

## Learn more

- [Motoko documentation](https://internetcomputer.org/docs/current/motoko/main/getting-started/motoko-introduction)
- [ICP development workflow](https://internetcomputer.org/docs/current/developer-docs/getting-started/development-workflow)
- [Inside canisters](https://internetcomputer.org/docs/current/developer-docs/smart-contracts/overview/inside-canisters)
- [Canister lifecycle](https://internetcomputer.org/docs/current/developer-docs/smart-contracts/overview/canister-lifecycle)
- [Application frontends](https://internetcomputer.org/docs/current/developer-docs/web-apps/application-frontends/overview)
- [React quickstart](https://internetcomputer.org/docs/current/developer-docs/getting-started/quickstart/react-quickstart)
