'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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

//import got from 'got';
class ApiKitClient {
    url;
    ky_or_got;
    http_lib;
    _auth_token;
    constructor(url, http_lib, ky_or_got, auth_token) {
        if (!url.endsWith('/')) {
            url = url + '/';
        }
        this.url = url;
        this.ky_or_got = ky_or_got;
        this.http_lib = http_lib;
        this._auth_token = auth_token;
    }
    query(typename) {
        return new Query(typename, this);
    }
    async _get(query) {
        let result = await this.ky_or_got.get(`${this.url}api/${query.typename}`, { searchParams: query.query_params, headers: this._gen_auth_header() }).json();
        return new CollectionResponse(this, query, result);
    }
    async get(typename, id) {
        let result = await this.ky_or_got.get(`/${this.url}api/${typename}/${id}`, { headers: this._gen_auth_header() }).json();
        return new InstanceResponse(result.data, this, typename);
    }
    async post(typename, data) {
        let result = await this.ky_or_got.post(`${this.url}api/${typename}`, this._gen_ky_got_params(data)).json();
        return new InstanceResponse(result.data, this, typename);
    }
    async put(typename, id, data) {
        let result = await this.ky_or_got.put(`${this.url}api/${typename}/${id}`, this._gen_ky_got_params(data)).json();
        return new InstanceResponse(result.data, this, typename);
    }
    async delete(typename, id) {
        let result = await this.ky_or_got.delete(`${this.url}api/${typename}/${id}`).json();
        return new InstanceResponse(result.data, this, typename);
    }
    async create_user(username, password) {
        let result = (await this.ky_or_got.post(`${this.url}api/user`, this._gen_ky_got_params({ username: username, password: password })).json());
        return result.data;
    }
    async create_user_and_log_in(username, password) {
        let result = await this.create_user(username, password);
        return {
            user: result,
            token: await this.login(username, password)
        };
    }
    async login(username, password) {
        let result = (await this.ky_or_got.post(`${this.url}api/login`, this._gen_ky_got_params({ username: username, password: password })).json());
        let token = result.token;
        this._auth_token = token;
        return token;
    }
    async set_token(token) {
        this._auth_token = token;
    }
    _gen_ky_got_params(body) {
        if (this.http_lib === 'ky') {
            return { json: body, headers: this._gen_auth_header() };
        }
        else if (this.http_lib === 'got') {
            return { json: body, headers: this._gen_auth_header() };
        }
    }
    _gen_auth_header() {
        let headers = {};
        // @ts-ignore
        if (this._auth_token) {
            headers.Authorization = 'BEARER ' + this._auth_token;
        }
        return headers;
    }
}

exports.ApiKitClient = ApiKitClient;
