import { WebClient } from "@slack/web-api";

import { Options } from "./interfaces/Options";

import getPosts from "./methods/getPosts";
import { Post } from "./interfaces/Post";

/**
 * Create a new instance of SlackCMS
 * @param slackToken The Slack API token. A token usually begins with xoxb or xoxp. You get them from each workspace an app is installed onto. The app configuration pages help you get your first token for your development workspace
 * @param options Options to pass to the SlackCMS instance
 * @returns A new instance of SlackCMS
 */
export class SlackCMS {
	slackToken: string;
	web: WebClient;
	options: Options;

	constructor(
		slackToken: string,
		options: Options = {
			limit: 200,
			allowEmptyMetadata: true,
			allowEmptyContent: false,
			allowOnlyMedia: false,
			pinnedOnly: false,
		}
	) {
		this.slackToken = slackToken;
		this.web = new WebClient(this.slackToken);
		this.options = options;
	}

	/**
	 * Get all posts from a channel
	 * @param channelIdentifier The channel name or ID to get posts from
	 * @returns An array of Post objects
	 */
	async getPosts(channelIdentifier: string): Promise<Post[]> {
		return await getPosts(this.web, channelIdentifier, this.options);
	}
}
