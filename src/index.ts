//import got from 'got';
//import ky from 'ky-universal';
import { Query } from './query';
import { InstanceResponse } from './instance_response';
import { CollectionResponse } from './collection_response';

export class ApiKitClient {
    url: string;
    ky_or_got: any;
    http_lib: 'ky' | 'got';
    _auth_token: string | undefined;

    constructor(url: string, http_lib: 'ky' | 'got', ky_or_got: any, auth_token: string | undefined) {
        if (!url.endsWith('/')) { url = url + '/';}
        this.url = url;
        this.ky_or_got = ky_or_got;
        this.http_lib = http_lib;
        this._auth_token = auth_token;
    }

    query(typename: string): Query {
        return new Query(typename, this);
    }

    async _get(query: Query): Promise<CollectionResponse> {
        let result = await this.ky_or_got.get(`${this.url}api/${query.typename}`, { searchParams: query.query_params, headers: this._gen_auth_header() }).json();
        return new CollectionResponse(this, query, (result as any));
    }
 
    async get(typename: string, id: string): Promise<InstanceResponse> {
        let result = await this.ky_or_got.get(`/${this.url}api/${typename}/${id}`, {headers: this._gen_auth_header()}).json();
        return new InstanceResponse((result as any).data, this, typename);
    }

    async post(typename: string, data: any): Promise<InstanceResponse> {
        let result = await this.ky_or_got.post(`${this.url}api/${typename}`, this._gen_ky_got_params(data)).json();
        return new InstanceResponse((result as any).data, this, typename);
    }

    async put(typename: string, id: string, data: any): Promise<InstanceResponse> {
        let result = await this.ky_or_got.put(`${this.url}api/${typename}/${id}`, this._gen_ky_got_params(data)).json();
        return new InstanceResponse((result as any).data, this, typename);
    }

    async delete(typename: string, id: string): Promise<InstanceResponse> {
        let result = await this.ky_or_got.delete(`${this.url}api/${typename}/${id}`).json();
        return new InstanceResponse((result as any).data, this, typename);
    }

    async create_user(username: string, password: string) {
        let result = (await this.ky_or_got.post(`${this.url}api/user`, this._gen_ky_got_params({ username: username, password: password })).json())
        return result.data;
    }

    async create_user_and_log_in(username: string, password: string) {
        let result = await this.create_user(username, password);
        return {
            user: result,
            token: await this.login(username, password)
        };
    }

    async login(username: string, password: string) {
        let result = (await this.ky_or_got.post(`${this.url}api/login`, this._gen_ky_got_params({ username: username, password: password })).json())
        let token = result.token;
        this._auth_token = token;
        return token;
    }

    async set_token(token: string) {
        this._auth_token = token;
    }

    _gen_ky_got_params(body: any) {
        if (this.http_lib === 'ky') {
            return { json: body, headers: this._gen_auth_header() };
        } else if (this.http_lib === 'got') {
            return { json: body, headers: this._gen_auth_header() };
        }
    }

    _gen_auth_header() {
        let headers = {};
        // @ts-ignore
        if (this._auth_token) { headers.Authorization = 'BEARER ' + this._auth_token }
        return headers;
    }
}



