import { User } from "@slack/web-api/dist/response/UsersInfoResponse";
import { Attachment, Reaction } from "@slack/web-api/dist/response/ChannelsHistoryResponse";
import { FileElement, Message } from "@slack/web-api/dist/response/ConversationsHistoryResponse";

export interface Post {
	frontMatter: {
		[key: string]: any;
		matter: string;
		isEmpty: boolean;
		excerpt?: string;
	};
	content: string;
	attachments?: Attachment[] | undefined;
	files?: FileElement[] | undefined;
	timestamp: string;
	author: User;
	reactions?: Reaction[] | undefined;
	comments?: Message[] | undefined;
}
