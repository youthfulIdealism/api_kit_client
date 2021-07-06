'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var got = require('got');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var got__default = /*#__PURE__*/_interopDefaultLegacy(got);

class Query {
    typename;
    query_params;
    api;
    constructor(typename, api) {
        this.typename = typename;
        this.query_params = {};
        this.api = api;
    }
    equal(field, value) {
        let new_query = this._clone();
        new_query.query_params[field] = value;
        return new_query;
    }
    less_than(field, value) {
        let new_query = this._clone();
        if (value instanceof Date) {
            value = value.toISOString();
        }
        new_query.query_params[field + '_lt'] = value;
        return new_query;
    }
    greater_than(field, value) {
        let new_query = this._clone();
        if (value instanceof Date) {
            value = value.toISOString();
        }
        new_query.query_params[field + '_gt'] = value;
        return new_query;
    }
    less_than_equal_to(field, value) {
        let new_query = this._clone();
        if (value instanceof Date) {
            value = value.toISOString();
        }
        new_query.query_params[field + '_lte'] = value;
        return new_query;
    }
    greater_than_equal_to(field, value) {
        let new_query = this._clone();
        if (value instanceof Date) {
            value = value.toISOString();
        }
        new_query.query_params[field + '_gte'] = value;
        return new_query;
    }
    cursor(value) {
        let new_query = this._clone();
        new_query.query_params.cursor = value;
        return new_query;
    }
    limit(value) {
        let new_query = this._clone();
        new_query.query_params.limit = value;
        return new_query;
    }
    async get() {
        return await this.api._get(this);
    }
    _clone() {
        let new_query = new Query(this.typename, this.api);
        for (let [key, value] of Object.entries(this.query_params)) {
            new_query.query_params[key] = value;
        }
        return new_query;
    }
}

class InstanceResponse {
    data;
    api;
    typename;
    constructor(data, api, typename) {
        this.api = api;
        this.data = data;
        this.typename = typename;
    }
    async refresh() {
        return await this.api.get(this.typename, this.data._id);
    }
    async post(data) {
        return await this.api.post(this.typename, this.data._id);
    }
    async put(data) {
        return await this.api.put(this.typename, this.data._id, data);
    }
    async delete() {
        return await this.api.delete(this.typename, this.data._id);
    }
}

class CollectionResponse {
    api;
    data;
    query;
    cursor;
    limit;
    get raw_datas() {
        return this.data.map(ele => ele.data);
    }
    constructor(api, query, data) {
        this.api = api;
        this.query = query;
        this.data = data.data.map(ele => new InstanceResponse(ele, this.api, query.typename));
        this.cursor = data.cursor;
        this.limit = data.limit;
    }
    async refresh() {
        return await this.api._get(this.query);
    }
    async next_page() {
        // if there's no cursor, return an empty collection response
        if (!this.cursor) {
            return new CollectionResponse(this.api, this.query._clone(), {
                data: [],
                limit: this.limit,
                cursor: undefined
            });
        }
        return await this.api._get(this.query.cursor(this.cursor));
    }
}

class ApiKitClient {
    url;
    constructor(url) {
        if (!url.endsWith('/')) {
            url = url + '/';
        }
        this.url = url;
    }
    query(typename) {
        return new Query(typename, this);
    }
    async _get(query) {
        let result = await got__default['default'].get(`${this.url}api/${query.typename}`, { searchParams: query.query_params }).json();
        return new CollectionResponse(this, query, result);
    }
    async get(typename, id) {
        let result = await got__default['default'](`/${this.url}api/${typename}/${id}`).json();
        return new InstanceResponse(result.data, this, typename);
    }
    async post(typename, data) {
        let result = await got__default['default'].post(`${this.url}api/${typename}`, { json: data }).json();
        return new InstanceResponse(result.data, this, typename);
    }
    async put(typename, id, data) {
        let result = await got__default['default'].put(`${this.url}api/${typename}/${id}`, { json: data }).json();
        return new InstanceResponse(result.data, this, typename);
    }
    async delete(typename, id) {
        let result = await got__default['default'].delete(`${this.url}api/${typename}/${id}`).json();
        return new InstanceResponse(result.data, this, typename);
    }
}

exports.ApiKitClient = ApiKitClient;
