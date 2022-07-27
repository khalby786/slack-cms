import { WebClient, ErrorCode } from "@slack/web-api";
import { Reaction } from "@slack/web-api/dist/response/ChannelsHistoryResponse";
import { Message } from "@slack/web-api/dist/response/ConversationsHistoryResponse"; // we need dem types
import { Channel } from "@slack/web-api/dist/response/ConversationsListResponse";
import { User } from "@slack/web-api/dist/response/UsersInfoResponse";
import * as matter from "gray-matter";
import { stringify } from "querystring";

// let's talk about this
// https://www.npmjs.com/package/gray-matter#returned-object
// there's supposed to be a `file.isEmpty` property, but it's not there in the types
// looking at the open PRs and issues, it looks like it won't be fixed anytime soon
// but hey, it works, I live to serve the Typescript compiler now

interface GreyMatterBase<I> {
	data: {
		[key: string]: any;
	};
	content: string;
	excerpt?: string;
	orig: Buffer | I;
	language: string;
	matter: string;
	empty: string;
	isEmpty: boolean;
	stringify(lang: string): string;
}

interface Post<I> {
	data: {
		content: string;
		excerpt?: string;
		timestamp: string;
		author: User;
		reactions: Reaction[] | undefined;
		[key: string]: any;
	};
	orig: Buffer | I;
	language: string;
	matter: string;
	empty: string;
	isEmpty: boolean;
}

export class Slack {
	slackToken: string;
	web: WebClient;

	constructor(slackToken: string) {
		this.slackToken = slackToken;

		const web = new WebClient(this.slackToken);
		this.web = web;
	}

	protected isEmpty(obj: object) {
		return Object.keys(obj).length === 0;
	}

	async getUser(userId: string): Promise<User | undefined> {
		const user = await this.web.users.info({
			user: userId,
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

		let posts: Post<string>[] = [];

		for await (const page of this.web.paginate("conversations.history", {
			channel: channelId,
			limit: 200,
		})) {
			for (const message of page.messages as Message[]) {
				const post = matter(message.text as string, { excerpt: true }) as GreyMatterBase<string>;
				if (post.isEmpty !== true && this.isEmpty(post.data) !== true) {
					// get user details as author stuff
					const user = await this.getUser(message.user as string);

					posts.push({
						data: {
							...post.data,
							content: post?.content,
							excerpt: post?.excerpt as string,
							author: user as User,
							timestamp: message.ts as string,
							reactions: message.reactions,
						},
						orig: post.orig,
						language: post.language,
						matter: post.matter,
						empty: post.empty,
						isEmpty: post.isEmpty,
					});
				}
			}
		}

		return posts;
	}
}
