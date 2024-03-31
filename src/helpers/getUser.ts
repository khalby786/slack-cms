import { WebClient, ErrorCode } from "@slack/web-api";
import { User } from "@slack/web-api/dist/response/UsersInfoResponse";

/**
 * Get information about a user
 * @param web WebClient instance from @slack/web-api
 * @param userId User ID to get information about
 * @returns User object or undefined if user is not found
 */
async function getUser(web: WebClient, userId: string): Promise<User | undefined> {
	const user = await web.users.info({
		user: userId,
	});

	return user.user;
}

export default getUser;
