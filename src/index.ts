type SlackCredentials = {
  sigingSecret: string;
  token: string;
}

export class Slack {
  channelName: string;
  slackTokens: SlackCredentials;

  constructor(channelName: string, slackTokens: SlackCredentials) {
    this.channelName = channelName;
    this.slackTokens = slackTokens;
  }
};