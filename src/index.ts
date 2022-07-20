import { WebClient } from "@slack/web-api";
import { Message } from "@slack/web-api/dist/response/ConversationsHistoryResponse"; // we need dem types
import { Channel } from "@slack/web-api/dist/response/ConversationsListResponse";
import * as matter from "gray-matter";

// let's talk about this
// https://www.npmjs.com/package/gray-matter#returned-object
// there's supposed to be a `file.isEmpty` property, but it's not there in the types
// looking at the open PRs and issues, it looks like it won't be fixed anytime soon
// but hey, it works, I live to serve the Typescript compiler now
interface GreyMatterFilePatch<I> {
	data: { [key: string]: any };
	content: string;
	excerpt?: string;
	orig: Buffer | I;
	language: string;
	matter: string;
	stringify(lang: string): string;
	isEmpty: boolean;
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

	// trade channel name for channel id
	// perf issues with this function, but it works
	async getChannel(channelName: string): Promise<string | undefined> {
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

			return channelId;
		} catch (error) {
			console.error(error);
		}
	}

	// get all messages from the specified channel using @slack/bolt
	async getMessages(channelIdentifier: string): Promise<any> {
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
		let posts: any[] = [];

		for (let message of messagesArray as Message[]) {
			let post = matter(message.text as string) as GreyMatterFilePatch<string>;
			if (post.isEmpty !== true && this.isEmpty(post.data) !== true) {
				posts.push(post);	
			}
		}

		return posts;
	}
}
