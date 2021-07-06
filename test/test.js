let express = require('express');
let mongoose = require('mongoose');
let api_kit = require('@liminalfunctions/api_kit');
let api_kit_client = require('../dist/index.js');
let express_asyncify = require('express-asyncify');
let assert = require('assert');
let Joi = require('joi')




describe('basic REST functionality', function () {
    let app;
    let server;
    let database;
    let ApiKitClient = api_kit_client.ApiKitClient;
    let api = new ApiKitClient('http://localhost:9000');

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
        database = await mongoose.connect('mongodb://localhost:27017/api_kit_client_test', { useNewUrlParser: true, useUnifiedTopology: true });
        await database.connection.db.dropDatabase();

        api_kit.config_joi(app, database, Joi.object({
            name: Joi.string(),
            ordinal: Joi.number().meta({ mongoose: { index: true } }),
            date_published: Joi.date().meta({ mongoose: { index: true } }),
        }), { name: 'database_type' });
        server = app.listen('9000');
    })

    after(function () {
        server.close();
        database.disconnect();
    });

    describe('POST', function () {
        it('the data returned from the POST should be the same as the input data', async function () {

            let results = [];
            for (let data of datas) {
                results.push(await api.post('database_type', data));
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

    describe('GET', function () {
        it('the data returned from the GET should be the same as the POSTed data', async function () {

            let results = (await api.query('database_type').get()).raw_datas;

            for (let q = 0; q < datas.length; q++) {
                let input_data = datas[q];
                let result = results.find(ele => ele.name === input_data.name);
                if (!result) { assert.fail('should be able to find response') }
                assert.equal(result.ordinal, input_data.ordinal);
                assert.equal(new Date(result.date_published).getTime(), input_data.date_published.getTime());
            }
        });

        it('lt should function', async function () {

            let results = (await api.query('database_type').less_than('ordinal', 2).get()).raw_datas;
            assert.equal(results.length, 2);

            for (let result of results) {
                if (result.ordinal >= 2) { assert.fail('query returned wrong data'); }
            }
        });

        it('gt should function', async function () {

            let results = (await api.query('database_type').greater_than('ordinal', 2).get()).raw_datas;
            assert.equal(results.length, 2);

            for (let result of results) {
                if (result.ordinal <= 2) { assert.fail('query returned wrong data'); }
            }
        });

        it('lte should function', async function () {

            let results = (await api.query('database_type').less_than_equal_to('ordinal', 2).get()).raw_datas;
            assert.equal(results.length, 3);

            for (let result of results) {
                if (result.ordinal > 2) { assert.fail('query returned wrong data'); }
            }
        });

        it('gte should function', async function () {

            let results = (await api.query('database_type').greater_than_equal_to('ordinal', 2).get()).raw_datas;
            assert.equal(results.length, 3);

            for (let result of results) {
                if (result.ordinal < 2) { assert.fail('query returned wrong data'); }
            }
        });

        it('limit should function', async function () {

            let results = (await api.query('database_type').limit(2).get()).raw_datas;
            assert.equal(results.length, 2);
        });

        it('cursor pagination should function', async function () {

            let results_0 = await api.query('database_type').limit(2).get();
            assert.equal(results_0.data.length, 2);

            let results_1 = await results_0.next_page();
            assert.equal(results_1.data.length, 2);

            let results_2 = await results_1.next_page();
            assert.equal(results_2.data.length, 1);
        });
    });

    describe('PUT', function () {
        it('the data returned from the PUT should be the same as the input data', async function () {
            let instances = await api.query('database_type').get();
            let responses = [];
            for (let instance of instances.data) {
                responses.push(await instance.put(Object.assign({}, instance.data, { ordinal: instance.data.ordinal + 1 })));
            }

            for (let response of responses) {
                assert.equal(datas.find(ele => ele.name === response.data.name).ordinal + 1, response.data.ordinal)
            }

            instances = (await api.query('database_type').get()).raw_datas;
            for (let instance of instances) {
                assert.equal(datas.find(ele => ele.name === instance.name).ordinal + 1, instance.ordinal)
            }
        });
    });

    describe('DELETE', function () {
        it('the data returned from the DELETE should be the same as the input data', async function () {
            let instances = await api.query('database_type').get();
            for (let instance of instances.data) { await instance.delete(); }

            instances = await api.query('database_type').get();
            assert.equal(instances.data.length, 0);
        });
    });
});
