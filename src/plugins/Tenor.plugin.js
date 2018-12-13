const axios = require('axios');

class Tenor {
    constructor() {
        this.client = null;
    }

    load(client, configService, env) {
        this.client = client;

        if (!env.TENOR_API_KEY) {
            return false;
        }

        client.addListener('message', (from, channel, text, message) => {
            if(configService.ignoringUser(message)) { return; }

            if (text.startsWith('.tenor ') && text.length > 7) {
                const query = text.replace('.tenor ', '');
                const destination = channel === this.client.nick ? from : channel;

                this.tenorSearch(query, env.TENOR_API_KEY)
                    .then(url => {
                        client.say(destination, url);
                    })
                    .catch(err => {
                        client.say(destination, "No results found.");
                        return false;
                    });
            }
        });

        return true;
    }

    tenorSearch(query, apiKey, limit = 1) {
        return new Promise((resolve, reject) => {
            // https://tenor.com/gifapi/documentation#quickstart-setup
            // https://tenor.com/gifapi/documentation#responseobjects-gif
            const url = 'https://api.tenor.com/v1/search';
            const params = {
                key: apiKey,
                q: query,
                limit,
            };

            axios.get(url, { params })
                 .then(({ data }) => {
                     if (data.results.length === 0) {
                         return reject(new Error('No results found'));
                     }

                     resolve(data.results[0].url);
                 })
                 .catch(err => reject(err));
        });
    }
}

module.exports = new Tenor();