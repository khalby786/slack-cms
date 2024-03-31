import { WebClient, ErrorCode } from "@slack/web-api";
import { Channel } from "@slack/web-api/dist/response/ConversationsListResponse";

/**
 * Get information about a channel
 * @param web WebClient instance from @slack/web-api
 * @param channelName Channel name to get information about
 * @returns Channel ID or undefined if channel is not found
 */
async function getChannel(web: WebClient, channelName: string): Promise<string | undefined> {
	try {
		let channelId: string | undefined;

		pagination: for await (const page of web.paginate("conversations.list", {
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

export default getChannel;
