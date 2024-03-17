import { WebClient } from "@slack/web-api";

import { Attachment, FileElement, Message } from "@slack/web-api/dist/response/ConversationsHistoryResponse"; // we need dem types
import { User } from "@slack/web-api/dist/response/UsersInfoResponse";
import * as matter from "gray-matter";

import GreyMatterBase from "./interfaces/GreyMatterBase";
import Post from "./interfaces/Post";
import Options from "./interfaces/Options";

import isEmpty from "./helpers/isEmpty";
import getChannel from "./helpers/getChannel";
import getUser from "./helpers/getUser";

export class SlackCMS {
	slackToken: string;
	web: WebClient;
	options: Options;

	constructor(
		slackToken: string,
		options: Options = {
			limit: 200,
			allowEmpty: false,
		}
	) {
		this.slackToken = slackToken;
		this.web = new WebClient(this.slackToken);
		this.options = options;
	}

	// get all messages from the specified channel using @slack/bolt
	async getPosts(channelIdentifier: string): Promise<any> {
		let channelId: string | undefined = "";
		if (channelIdentifier.startsWith("#")) {
			channelId = await getChannel(this.web, channelIdentifier.substring(1));
		} else {
			channelId = channelIdentifier;
		}

		let posts: Post<string>[] = [];

		for await (const page of this.web.paginate("conversations.history", {
			channel: channelId,
			limit: this.options.limit,
		})) {
			for (const message of page.messages as Message[]) {
				// skip if the message is not actually a message
				if (message.subtype) continue;

				const post = matter(message.text as string, this.options.grayMatterOptions) as GreyMatterBase<string>;

				// if post.data.published == false, skip
				if (post.data.published && post.data.published === false) continue;

				// if the post data is not empty, add it to the array
				if (!isEmpty(post.data) || this.options.allowEmpty) {
					// get user details as author
					const user = await getUser(this.web, message.user as string);
					const thread_ts = message.thread_ts as string;

					// continuation to the post
					let addendumContent: string = "\n";
					let postFiles: FileElement[] | undefined = [];
					let postAttachments: Attachment[] | undefined = [];
					let lastUpdatedTimestamp: string;
					let comments: Message[] | undefined = [];

					if (message.reply_count && message.reply_count > 0) {
						// get thread replies
						for await (const page of this.web.paginate("conversations.replies", {
							channel: channelId,
							ts: thread_ts,
						})) {
							for (const threadMessage of page.messages as Message[]) {
								if (threadMessage.subtype) continue;
								if (threadMessage.user === message.user) {
									// because slack returns the parent thread message as well
									if (threadMessage.ts === threadMessage.thread_ts) continue;

									const threadPost = matter(
										threadMessage.text as string,
										this.options.grayMatterOptions
									) as GreyMatterBase<string>;

									if (threadPost.data.continuation === false) {
										// if frontend matter has data.continuation as false, then we stop adding to the post
										continue;
									} else {
										addendumContent += threadPost.content as string + "\n";
										if (threadMessage.attachments)
											postAttachments = postAttachments?.concat(threadMessage.attachments as Attachment[]);
										if (threadMessage.files) postFiles = postFiles?.concat(threadMessage.files as FileElement[]);
										lastUpdatedTimestamp = threadMessage.ts as string;
									}
								} else {
									comments.push(threadMessage);
								}
							}
						}
					}

					// add all attachments together
					if (message.attachments) postAttachments = postAttachments?.concat(message.attachments as Attachment[]);
					if (message.files) postFiles = postFiles?.concat(message.files as FileElement[]);

					posts.push({
						frontMatter: {
							...post.data,
							matter: post.matter,
							isEmpty: post.isEmpty,
							excerpt: post?.excerpt as string,
						},
						content: (post?.content + addendumContent) as string,
						attachments: postAttachments,
						files: postFiles,
						author: user as User,
						timestamp: message.ts as string,
						// readableTimestamp: new Date(parseFloat(message.ts as string) * 1000).toUTCString(),
						reactions: message.reactions,
						comments: comments,
					});
				}
			}
		}

		return posts.sort(function (x, y) {
			return Number(x.timestamp) - Number(y.timestamp);
		});
	}
}
