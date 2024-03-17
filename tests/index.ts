// we could use proper testing, like jest or ava
// but for now we could simply check if the code works

import { SlackCMS } from "../src/index";
import * as dotenv from "dotenv";
dotenv.config({ debug: true });

const cms = new SlackCMS(process.env.SLACK_TOKEN as string, {
  allowEmpty: false,
  limit: 1
});

cms.getPosts("C03PH1KLD8T").then((posts) => {
  console.log(posts, { depth: null });
});
