#!/usr/bin/env node

import { shortString } from "starknet";

const message = "Hello, Starknet!";
const encoded = shortString.encodeShortString(message.slice(0, 31));

console.log(message);
console.log("Encoded as felt:", encoded);
