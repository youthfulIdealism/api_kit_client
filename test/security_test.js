let express = require('express');
let mongoose = require('mongoose');
let api_kit = require('@liminalfunctions/api-kit');
let api_kit_client = require('../dist/index.js');
let express_asyncify = require('express-asyncify');
let assert = require('assert');
let Joi = require('joi')
let got = require('got');



describe('auth', function () {
    let app;
    let server;
    let database;
    let ApiKitClient = api_kit_client.ApiKitClient;
    let api = new ApiKitClient('http://localhost:9000', 'got', got);

    let datas = [
        {
            name: 'entry 0',
            ordinal: 0,
            date_published: new Date('2000-01-01')
        },
        {
            name: 'entry 1',
            ordinal: 1,
            date_published: new Date('2000-02-01')
        },
        {
            name: 'entry 2',
            ordinal: 2,
            date_published: new Date('2000-03-01')
        },
        {
            name: 'entry 3',
            ordinal: 3,
            date_published: new Date('2000-04-01')
        },
        {
            name: 'entry 4',
            ordinal: 4,
            date_published: new Date('2000-05-01')
        },
    ];

    before(async function () {
        app = express_asyncify(express());
        api_kit.apply_boilerplate_middleware(app);
        database = await mongoose.createConnection('mongodb://localhost:27017/api_kit_client_test', { useNewUrlParser: true, useUnifiedTopology: true });
        await database.db.dropDatabase();

        api_kit.config_authentication(app, database, 'grizzled')

        api_kit.config_joi(app, database, Joi.object({
            name: Joi.string(),
            ordinal: Joi.number().meta({ mongoose: { index: true } }),
            date_published: Joi.date().meta({ mongoose: { index: true } }),
            user: Joi.string(),
        }), {
            name: 'database_type',
                security: {
                    user: {
                        read: true,
                        write: true,
                        delete: true,
                    }
                }
        });
        server = app.listen('9000');
    })

    after(function () {
        server.close();
        mongoose.disconnect();
    });

    describe('User', async function () {
        it('user creation, authentication, and authenticated results should all function.', async function () {
            let user_id;
            try {
                user_id = (await api.create_user_and_log_in('stanley', 'wallaby')).user._id;
            } catch (err) {
                throw err;
            }
            
            
            let results = [];
            for (let data of datas) {
                results.push(await api.post('database_type', Object.assign({ user: user_id}, data)));
            }

            for (let q = 0; q < datas.length; q++) {
                let result = results[q];
                let input_data = datas[q];
                assert.equal(result.data.name, input_data.name);
                assert.equal(result.data.ordinal, input_data.ordinal);
                assert.equal(new Date(result.data.date_published).getTime(), input_data.date_published.getTime());
            }
        });
    });
});
