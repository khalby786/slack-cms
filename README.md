# slack-cms

[![npm](https://nodei.co/npm/slack-cms.png)](https://npmjs.com/package/slack-cms)

What if you could run [a blog from a Slack channel](https://slack-cms.vercel.app/)?

This package lets you fetch messages from a particular Slack channel as "posts" and includes all the data you will need to display them. It comes with batteries included, so you can render Slack data easily.

## Getting Started

First, you need to [create a Slack app](https://api.slack.com/apps) and install it in your workspace.

Make sure it has the following scopes:

- `channels:history`
- `channels:read`
- `chat:write`
- `emoji:read`
- `groups:history`
- `groups:read`
- `pins:read`
- `reactions:read`
- `user:read`

Then, you can install the package:

```bash
npm install slack-cms

# or yarn
yarn add slack-cms
```

## Usage

```javascript
import { SlackCMS } from "slack-cms";

// A token usually begins with xoxb or xoxp.
// You get them from each workspace an app is installed onto.

const SLACK_TOKEN = process.env.SLACK_TOKEN;

const cms = new SlackCMS(SLACK_TOKEN, {
	// default options
	limit: 200,
	allowEmptyMetadata: true,
	allowEmptyContent: false,
	allowOnlyMedia: false,
	pinnedOnly: false,
});

await cms.posts("#channel_name"); // or channel ID
// ^ THATS LITERALLY IT
```

### Options

```js
export interface Options {
	/**
	 * The maximum number of posts to return
	 */
	limit?: number;

	/**
	 * If true, posts with empty metadata will be included in the array
	 */
	allowEmptyMetadata?: boolean;

	/**
	 * If true, posts with empty content will be included in the array
	 */
	allowEmptyContent?: boolean;

	/**
	 * If true, only posts with media will be included in the array
	 */
	allowOnlyMedia?: boolean;

	/**
	 * If true, only pinned posts will be included in the array
	 */
	pinnedOnly?: boolean;

	/**
	 * A list of uesrs to exclude from the posts
	 */
	optUserOutFromPosts?: string[];

	/**
	 * Options to pass to gray-matter
	 * {@link https://github.com/jonschlinkert/gray-matter?tab=readme-ov-file#options}
	 */
	grayMatterOptions?: {
		excerpt?: boolean | ((input: string | Buffer, output: Options["grayMatterOptions"]) => string);
		excerpt_separator?: string;
		engines?: {
			[index: string]:
				| ((input: string) => object)
				| { parse: (input: string) => object; stringify?: (data: object) => string };
		};
		language?: string;
		delimiters?: string | [string, string];
	};

	/**
	 * Options to pass to slack-markdown
	 * {@link https://www.npmjs.com/package/slack-markdown#options}
	 */
	slackParserOptions?: SlackMarkdownOptions;
}
```

## Features

### Parse post content as HTML

slack-cms automatically parses the content of your Slack messages (yes, even custom emojis) as HTML using a standalone parser built atop [slack-markdown](https://npmjs.com/package/slack-markdown).

<details>
  <summary>Use only the parser and not the rest of the package lol</summary>
  
  ```javascript
  import { parse } from "slack-cms";

  // workaround to render custom Slack emojis
  // omit the next two lines if you don't mind not rendering custom emojis
  const { WebClient } = require("@slack/web-api");
  const web = new WebClient(process.env.SLACK_TOKEN);

  parse("*hello*").then((post) => {
    console.log(post, web, options); // <b>hello</b>
  });

  // Parsing options:
  // https://khalby786.github.io/slack-cms/functions/helpers_parse.parse.html
  ```
</details>

### Parse front-matter

You can add metadata to your Slack messages using front-matter, and slack-cms will parse it for you!

### Thread replies as comments

slack-cms will automatically fetch thread replies and attach them to the main post as main comments.

### Continue post in thread reply

If you hit the character limit, you can continue your post in a thread reply, and slack-cms will append it to the main post.

<details>
  <summary>Disable continue post in thread reply</summary>
  Add a 

  ```
  ---
  continuation: false
  ---
  ```
  to the front-matter to your thread reply.
</details>

### Get only pinned messages

You can fetch only pinned messages from a channel using the `pinnedOnly` option. Read more in the [documentation](https://khalby786.github.io/slack-cms/interfaces/interfaces_Options.Options.html#pinnedOnly).

### Restrict to only media messages

You can fetch only media messages (messages with files) from a channel using the `allowOnlyMedia` option. Read more in the [documentation](https://khalby786.github.io/slack-cms/interfaces/interfaces_Options.Options.html#allowOnlyMedia).

### Opt users out of being included in posts

You can opt users out of being included in posts by adding their user IDs to `optUserOutFromPosts` in the options. Read more in the [documentation](https://khalby786.github.io/slack-cms/interfaces/interfaces_Options.Options.html#optUserOutFromPosts).

## Documentation

You can find the full documentation [here](https://khalby786.github.io/slack-cms/).

Additionally, check out the [example](https://slack-cms.vercel.app/) of a blog running on [Hack Club](https://hackclub.com/)'s #happenings channel. You can find the source code in the [example](https://github.com/khalby786/slack-cms/tree/main/example) directory.

## License

This project is licensed under the [MIT License](https://github.com/khalby786/slack-cms/blob/main/LICENSE.md).

## Why

![What if?](https://upload.wikimedia.org/wikipedia/en/b/b6/What_If...%3F_%28TV_series%29_logo.png)

...you could run a blog from a Slack channel?

Seeing how the [first commit](https://github.com/khalby786/slack-cms/commit/f16402a5332a6891b9fcae6975ea8e9f903064cb) was made two years ago, I'm not too sure on the exact reason why I started this project. I remember thinking it'd be cool if there was an easy way to aggregate data from a Slack channel and display it nicely on a website.

I was going through my GitHub repositories, and it was also one of the first times I used Typescript in an actual production(?) environment. It worked well with the Slack SDK which made me really happy.

![https://www.reddit.com/r/ProgrammerHumor/comments/s9fech/typescript_evangelists/ by u/
kwietog
](https://preview.redd.it/typescript-evangelists-v0-0qompm4ao2d81.jpg?width=1080&crop=smart&auto=webp&s=1ce3a727cb9853275ded3681d97e99a6c8013723)

For two years, it was just me and Slack CMS Test in a private channel talking to each other because I had no other real friends. I'm glad that I got the motivation to finish this project, and I hope it can be useful to someone.

Now, I can sleep peacefully. I'm tired.

## If you're interested...
Check out [Jsoning](https://github.com/khalby786/jsoning)! It's another cool package I've made!