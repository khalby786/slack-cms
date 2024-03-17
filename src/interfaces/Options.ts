import * as matter from "gray-matter";

export default interface Options {
	limit?: number;
	/**
	 * If true, posts with empty metadata will be included in the array
	 */
	allowEmpty?: boolean;

	// https://github.com/jonschlinkert/gray-matter/blob/master/gray-matter.d.ts
	/**
	 * Options to pass to gray-matter
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
}
