import { ErrorCode, WebClient } from "@slack/web-api";
import { Attachment, FileElement, Message } from "@slack/web-api/dist/response/ConversationsHistoryResponse"; // we need dem types
import { User } from "@slack/web-api/dist/response/UsersInfoResponse";
import matter from "gray-matter";

import { GreyMatterBase } from "../interfaces/GreyMatterBase";
import { Post } from "../interfaces/Post";
import { Options } from "../interfaces/Options";

import isEmpty from "../helpers/isEmpty";
import getChannel from "../helpers/getChannel";
import getUser from "../helpers/getUser";
import { parse } from "../helpers/parse";

interface Comment extends Message {
	author?: User | undefined;
}

async function getPosts(web: WebClient, channelIdentifier: string, options: Options): Promise<Post[]> {
	let channelId: string | undefined = "";
	if (channelIdentifier.startsWith("#")) {
		channelId = await getChannel(web, channelIdentifier.substring(1));
	} else {
		channelId = channelIdentifier;
	}

	let posts: Post[] = [];
	const slackPaginationLimit = options.limit && options.limit > 200 ? 200 : options.limit;
	let paginationCounter = 0;

	try {
		for await (const page of web.paginate("conversations.history", {
			channel: channelId,
			limit: slackPaginationLimit,
		})) {
			if (options.limit && paginationCounter >= options.limit) break;

			for (const message of page.messages as Message[]) {
				// skip if the author is in the optUserOutFromPosts list
				if (options.optUserOutFromPosts && options.optUserOutFromPosts.includes(message.user as string)) continue;

				// skip if the message is not actually a message
				if (message.subtype) continue;

				// pinnedOnly is true, skip if message is not pinned
				if (options.pinnedOnly && !message.hasOwnProperty("pinned_info")) continue;

				const post = matter(message.text as string, options.grayMatterOptions) as GreyMatterBase<string>;

				// if post.data.published == false, skip
				if (post.data.published && post.data.published === false) continue;

				// if allowOnlyMedia is true, skip if there are no files or attachments
				if (options.allowOnlyMedia && !message.files && !message.attachments) continue;

				// if allowEmptyMetadata is false, skip if metadata is empty
				if (!options.allowEmptyMetadata && isEmpty(post.data)) continue;

				// if allowEmptyContent is false, skip if content is empty
				if (!options.allowEmptyContent && post.content === "") continue;

				// get user details as author
				const user = await getUser(web, message.user as string);
				const thread_ts = message.thread_ts as string;

				// continuation to the post
				let addendumContent: string = "\n";
				let postFiles: FileElement[] | undefined = [];
				let postAttachments: Attachment[] | undefined = [];
				let comments: Comment[]| undefined = [];

				// message thread replies
				if (message.reply_count && message.reply_count > 0) {
					// get thread replies
					for await (const page of web.paginate("conversations.replies", {
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
									options.grayMatterOptions
								) as GreyMatterBase<string>;

								if (threadPost.data.continuation === false) {
									// if frontend matter has data.continuation as false, then we stop adding to the post
									threadMessage.text = await parse(threadMessage.text as string, web, options.slackParserOptions);
									comments.push({
										...threadMessage,
										author: await getUser(web, threadMessage.user as string),
									});
								} else {
									addendumContent += (threadPost.content as string) + "\n";
									if (threadMessage.attachments)
										postAttachments = postAttachments?.concat(threadMessage.attachments as Attachment[]);
									if (threadMessage.files) postFiles = postFiles?.concat(threadMessage.files as FileElement[]);
								}
							} else {
								threadMessage.text = await parse(threadMessage.text as string, web, options.slackParserOptions);
								comments.push({
									...threadMessage,
									author: await getUser(web, threadMessage.user as string),
								});
							}
						}
					}
				}

				// add all attachments together
				if (message.attachments) postAttachments = postAttachments?.concat(message.attachments as Attachment[]);
				if (message.files) postFiles = postFiles?.concat(message.files as FileElement[]);

				const content = await parse((post?.content + addendumContent) as string, web, options.slackParserOptions);

				posts.push({
					frontMatter: {
						...post.data,
						matter: post.matter,
						isEmpty: post.isEmpty,
						excerpt: post?.excerpt as string,
					},
					content: content,
					attachments: postAttachments,
					files: postFiles,
					author: user as User,
					timestamp: message.ts as string,
					reactions: message.reactions,
					comments: comments,
				});

				paginationCounter += slackPaginationLimit ? slackPaginationLimit : 0;
			}
		}

		posts = posts.sort(function (x: Post, y: Post) {
			return Number(x.timestamp) - Number(y.timestamp);
		});

		return options.limit ? posts.slice(-options.limit) : posts;
	} catch (error: any) {
		if (error.code === ErrorCode.PlatformError) {
			console.log(error.data);
		} else {
			// Some other error, oh no!
			console.log("Well, that was unexpected.");
		}
		return [];
	}
}

export default getPosts;
