const { SlackCMS } = require("../../lib/src/index.js");

const cms = new SlackCMS(process.env.SLACK_TOKEN, {
	allowEmptyMetadata: true,
	slackParserOptions: {
		escapeHTML: false,
		slackOnly: true,
		noExtraSpanTags: true,
		slackCallbacks: {
			channel: (channel) => {
				return `<a href="https://hackclub.slack.com/archives/${channel.id}" class="slack-channel" data-channel-id="${channel.id}">#${channel.name}</a>`;
			},
			user: (user) => {
				return `<a href="https://hackclub.slack.com/team/${user.id}" class="slack-user" data-user-id="${user.id}">@${
					user.name ? user.name : user.id
				}</a>`;
			},
		},
	},
});

module.exports = async function () {
	let data = await cms.posts("C05B6DBN802");
	let posts = [];

	// if post.attachments.from_url is present, it means the attachment is a post from another channel and we should add it to the post content
	data.forEach(async (post) => {
		if (post.attachments && post.attachments[0].from_url) {
			post.extraContent = `${post.attachments[0].fallback}`;
			posts.push(post);
		} else {
			posts.push(post);
		}
	});

	console.dir(posts[0], { depth: null });
	return posts;
};
