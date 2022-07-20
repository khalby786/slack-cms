// we could use proper testing, like jest or ava
// but for now we could simply check if the code works

import { Slack, SlackCredentials } from "../src/index";
import * as dotenv from "dotenv";

console.log(__dirname);
dotenv.config({ debug: true });

// let tokens: SlackCredentials = {
//   token: process.env.SLACK_TOKEN as string
// }

(async () => {
  const cms = new Slack({ token: process.env.SLACK_TOKEN as string });
  // console.log(await cms.getMessages("#slack-cms-test"));
  console.log(await cms.getPosts("C03PH1KLD8T"));
})();
