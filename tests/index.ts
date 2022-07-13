// we could use proper testing, like jest or ava
// but for now we could simply check if the code works

import { Slack, SlackCredentials } from "../src/index";
import * as dotenv from "dotenv";

console.log(__dirname);
dotenv.config({ debug: true });

let tokens: SlackCredentials = {
  sigingSecret: process.env.SLACK_SIGNING_SECRET as string,
  token: process.env.SLACK_TOKEN as string
}

console.log(tokens);