// we could use proper testing, like jest or ava
// but for now we could simply check if the code works

import { SlackCMS, parse } from "../src/index";
import * as dotenv from "dotenv";
dotenv.config({ debug: true });

const cms = new SlackCMS(process.env.SLACK_TOKEN as string, {
  allowEmptyMetadata: true,
});

cms.posts("C05B6DBN802").then((posts) => {
	console.log(posts);
});

// parse("*hello*").then((post) => {
//   console.log(post);
// });