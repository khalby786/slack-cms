// let's talk about this
// https://www.npmjs.com/package/gray-matter#returned-object
// there's supposed to be a `file.isEmpty` property, but it's not there in the types
// looking at the open PRs and issues, it looks like it won't be fixed anytime soon
// but hey, it works, I live to serve the Typescript compiler now

export default interface GreyMatterBase<I> {
	/** The object created by parsing front-matter */
	data: {
		[key: string]: any;
	};

	/** The input string, with matter stripped */
	content: string;

	/** An excerpt of the post */
	excerpt?: string;

	/** The original input string (or buffer) */
	orig: Buffer | I;

	/** The front-matter language that was parsed. YAML is the default */
	language: string;

	/** The raw, un-parsed front-matter string */
	matter: string;

	empty: string;
	isEmpty: boolean;

	/** Stringify the file by converting file.data to a string in the given language, wrapping it in delimiters and prepending it to file.content */
	stringify(lang: string): string;
}
