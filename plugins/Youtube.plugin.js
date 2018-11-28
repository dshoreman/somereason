class Youtube {
    constructor() {
        this.client = null;
        this.search = require('youtube-search');
    }

    load(client, configService, env) {
        this.client = client;

        if (!env.YT_API_KEY) {
            return false;
        }

        client.addListener('message', (from, channel, text, message) => {
            if (text.startsWith('.yt ') && text.length > 4) {
                const query = text.replace('.yt ', '');
                const options = {
                    maxResults: 1,
                    key: env.YT_API_KEY,
                };

                this.search(query, options, (err, results) => {
                    const destination = channel === this.client.nick ? from : channel;

                    if (err || results.length === 0) {
                        client.say(destination, "No results found.");
                        return false;
                    }

                    client.say(destination, `${results[0].link} - ${results[0].title}`);
                });
            }
        });

        return true;
    }
}

module.exports = new Youtube();
