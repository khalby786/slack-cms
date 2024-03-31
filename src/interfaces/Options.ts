import { SlackMarkdownOptions } from "slack-markdown";

export interface Options {
	/**
	 * The maximum number of posts to return
	 */
	limit?: number;

	/**
	 * If true, posts with empty metadata will be included in the array
	 */
	allowEmptyMetadata?: boolean;

	/**
	 * If true, posts with empty content will be included in the array
	 */
	allowEmptyContent?: boolean;

	/**
	 * If true, only posts with media will be included in the array
	 */
	allowOnlyMedia?: boolean;

	/**
	 * If true, only pinned posts will be included in the array
	 */
	pinnedOnly?: boolean;

	/**
	 * A list of uesrs to exclude from the posts
	 */
	optUserOutFromPosts?: string[];

	/**
	 * Options to pass to gray-matter
	 * {@link https://github.com/jonschlinkert/gray-matter?tab=readme-ov-file#options}
	 */
	grayMatterOptions?: {
		excerpt?: boolean | ((input: string | Buffer, output: Options["grayMatterOptions"]) => string);
		excerpt_separator?: string;
		engines?: {
			[index: string]:
				| ((input: string) => object)
				| { parse: (input: string) => object; stringify?: (data: object) => string };
		};
		language?: string;
		delimiters?: string | [string, string];
	};

	/**
	 * Options to pass to slack-markdown
	 * {@link https://www.npmjs.com/package/slack-markdown#options}
	 */
	slackParserOptions?: SlackMarkdownOptions;
}
