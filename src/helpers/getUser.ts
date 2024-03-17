import { WebClient, ErrorCode } from "@slack/web-api";
import { User } from "@slack/web-api/dist/response/UsersInfoResponse";

async function getUser(web: WebClient, userId: string): Promise<User | undefined> {
	const user = await web.users.info({
		user: userId,
	});

	return user.user;
}

export default getUser;
