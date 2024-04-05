import { WebClient } from "@slack/web-api";
import { SlackMarkdownOptions, toHTML } from "slack-markdown";
import { User } from "@slack/web-api/dist/response/UsersInfoResponse";

import isUrl from "is-url";
import EmojiConvertor from "emoji-js";

const emoji = new EmojiConvertor();
emoji.replace_mode = "unified";
emoji.allow_native = true;

/**
 * Parse a Slack-formatted string to HTML
 * @param mrdkwn The Slack formatted string to parse
 * @param web WebClient instance from @slack/web-api
 * @param options slack-markdown options
 * @returns HTML-formatted string
 */
export async function parse(
	mrdkwn: string,
	web?: WebClient,
	options: SlackMarkdownOptions = {
		escapeHTML: false,
		slackOnly: true,
		noExtraSpanTags: true,
		slackCallbacks: {
			user: (data: { id: string; name: string }) => {
				return `<span class="slack-user" data-user-id="${data.id}">@${data.id}</span>`;
			},
			channel: (data: { id: string; name: string }) => {
				return `<span class="slack-channel" data-channel-id="${data.id}">#${data.name}</span>`;
			},
			usergroup: (data: { id: string; name: string }) => {
				return `<span class="slack-usergroup" data-usergroup-id="${data.id}">${data.name}</span>`;
			},
			atHere: () => {
				return `<span class="slack-mention slack-at-here">@here</span>`;
			},
			atChannel: () => {
				return `<span class="slack-mention slack-at-channel">@channel</span>`;
			},
			atEveryone: () => {
				return `<span class="slack-mention slack-at-everyone">@everyone</span>`;
			},
			date: (data: { timestamp: string }) => {
				return `<span class="slack-date" data-timestamp="${data.timestamp}">${data.timestamp}</span>`;
			},
		},
	}
) {
	// default emojis
	mrdkwn = emoji.replace_colons(mrdkwn);

	// custom slack emojis
	if (web) {
		const emojis = await web.emoji.list();
		if (emojis.error) {
			console.error(emojis.error);
		} else {
			mrdkwn = mrdkwn.replace(/:([a-zA-Z0-9-_]+):/g, (match, emoji) => {
				if (emojis.emoji && emojis.emoji[emoji]) {
					return `<img class="emoji" src="${emojis.emoji[emoji]}" alt="${emoji}">`;
				} else {
					return match;
				}
			});
		}
	}

	mrdkwn = mrdkwn.trim();

	// bold
	mrdkwn = mrdkwn.replace(/\*(.*?)\*/g, "<b>$1</b>");

	// strike
	mrdkwn = mrdkwn.replace(/\~(.*?)\~/g, "<strike>$1</strike>");

	// italics
	mrdkwn = mrdkwn.replace(/\_(.*?)\_/g, "<i>$1</i>");

	// use slack-markdown to convert markdown to html
	mrdkwn = toHTML(mrdkwn, options);

	// replace valid urls in the format <http://example.com|example.com> with <a href="http://example.com">example.com</a>
	mrdkwn = mrdkwn.replace(/<([^<>|]+)\|([^<>]+)>/g, '<a href="$1">$2</a>');

	// replace valid urls in the format <http://example.com> with <a href="http://example.com">http://example.com</a>
	// replace valid urls in the format <http://example.com> with <a href="http://example.com">http://example.com</a>
	mrdkwn = mrdkwn.replace(/<([^<>]+)>/g, (match, url) => {
		if (isUrl(url)) {
			return `<a href="${url}">${url}</a>`;
		} else {
			return match;
		}
	});

	// replace \n with <br>
	mrdkwn = mrdkwn.replace(/(\r\n|\r|\n)/g, "<br>");
	
	return mrdkwn;
}
