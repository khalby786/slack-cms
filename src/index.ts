import { WebClient } from "@slack/web-api";
import { Message } from "@slack/web-api/dist/response/ConversationsHistoryResponse"; // we need dem types
import { Channel } from "@slack/web-api/dist/response/ConversationsListResponse";
import { User } from "@slack/web-api/dist/response/UsersInfoResponse";
import * as matter from "gray-matter";

// let's talk about this
// https://www.npmjs.com/package/gray-matter#returned-object
// there's supposed to be a `file.isEmpty` property, but it's not there in the types
// looking at the open PRs and issues, it looks like it won't be fixed anytime soon
// but hey, it works, I live to serve the Typescript compiler now

interface GreyMatterBase<I> {
	data: { [key: string]: any };
	content: string;
	excerpt?: string;
	orig: Buffer | I;
	language: string;
	matter: string;
	stringify(lang: string): string;
	empty: string;
	isEmpty: boolean;
}

interface Post<I> extends GreyMatterBase<I> {
	unixTimestamp: string;
	author: User;
}

export type SlackCredentials = {
	token: string;
};

export class Slack {
	slackTokens: SlackCredentials;
	web: WebClient;
	protected isBreak: boolean = false;

	constructor(slackTokens: SlackCredentials) {
		this.slackTokens = slackTokens;

		const web = new WebClient(this.slackTokens.token);
		this.web = web;
	}

	protected isEmpty(obj: object) {
		return Object.keys(obj).length === 0;
	}

	protected async getUser(userId: string): Promise<User | undefined> {
		const user = await this.web.users.info({
			user: userId
		});

		return user.user;
	}

	// trade channel name for channel id
	// perf issues with this function, but it works
	protected async getChannel(channelName: string): Promise<string | undefined> {
		try {
			let channelId: string | undefined;

			pagination: for await (const page of this.web.paginate("conversations.list", {
				types: "public_channel,private_channel",
				limit: 200,
			})) {
				for (let channel of page.channels as Channel[]) {
					if (channel.name === channelName) {
						channelId = channel.id;
						break pagination;
					}
				}
			}

			console.log(channelId);

			return channelId;
		} catch (error) {
			console.error(error);
		}
	}

	// get all messages from the specified channel using @slack/bolt
	async getPosts(channelIdentifier: string): Promise<any> {
		let channelId: string | undefined = "";

		if (channelIdentifier.startsWith("#")) {
			channelId = await this.getChannel(channelIdentifier.substring(1));
		} else {
			channelId = channelIdentifier;
		}

		const messages = await this.web.conversations.history({
			channel: channelId as string,
			limit: 200,
		});

		let messagesArray: Message[] | undefined = messages.messages;
		let posts: Post<string>[] = [];

		for (let message of messagesArray as Message[]) {
			// console.log(message);
			let post = matter(message.text as string) as GreyMatterBase<string>;
			if (post.isEmpty !== true && this.isEmpty(post.data) !== true) {
				// get user details as author stuff
				let user = await this.getUser(message.user as string);

				posts.push({ ...post, unixTimestamp: message.ts as string, author: user as User });
			}
		}

		return posts;
	}
}
