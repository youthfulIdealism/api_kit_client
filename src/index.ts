import got from 'got';
import { Query } from './query';
import { InstanceResponse } from './instance_response';
import { CollectionResponse } from './collection_response';

export class ApiKitClient {
    url: string;

    constructor(url: string) {
        if (!url.endsWith('/')) { url = url + '/';}
        this.url = url;
    }

    query(typename: string): Query {
        return new Query(typename, this);
    }

    async _get(query: Query): Promise<CollectionResponse> {
        let result = await got.get(`${this.url}api/${query.typename}`, { searchParams: query.query_params }).json();
        return new CollectionResponse(this, query, (result as any));
    }
 
    async get(typename: string, id: string): Promise<InstanceResponse> {
        let result = await got(`/${this.url}api/${typename}/${id}`).json();
        return new InstanceResponse((result as any).data, this, typename);
    }

    async post(typename: string, data: any): Promise<InstanceResponse> {
        let result = await got.post(`${this.url}api/${typename}`, { json: data }).json();
        return new InstanceResponse((result as any).data, this, typename);
    }

    async put(typename: string, id: string, data: any): Promise<InstanceResponse> {
        let result = await got.put(`${this.url}api/${typename}/${id}`, { json: data }).json();
        return new InstanceResponse((result as any).data, this, typename);
    }

    async delete(typename: string, id: string): Promise<InstanceResponse> {
        let result = await got.delete(`${this.url}api/${typename}/${id}`).json();
        return new InstanceResponse((result as any).data, this, typename);
    } 
}



