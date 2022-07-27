// we could use proper testing, like jest or ava
// but for now we could simply check if the code works

import { Slack } from "../src/index";
import * as dotenv from "dotenv";

console.log(__dirname);
dotenv.config({ debug: true });

// let tokens: SlackCredentials = {
//   token: process.env.SLACK_TOKEN as string
// }

const cms = new Slack(process.env.SLACK_TOKEN as string);

// (async () => {
  
//   console.time();
//   // console.log(await cms.getPosts("C03PH1KLD8T"));
//   // console.log(await cms.getUser("..."));
    
//   console.timeEnd(); 
//   console.log("done");
// })();

// cms.getUser("...").then(user => console.log(user)).catch(err => console.error(err));

// console.log("outside async block")

(async() => {
  try {
    console.time();
    await cms.getPosts("...");
    console.timeEnd();

    for (let i = 0; i < 4; i++) {
      console.log(i);
    }
  } catch (error) {
    console.error(error);
  }
})()