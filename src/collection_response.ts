import { ApiKitClient } from './index';
import { InstanceResponse } from './instance_response';
import { Query } from './query';

export class CollectionResponse {
    api: ApiKitClient;
    data: InstanceResponse[];
    query: Query;
    cursor: string | undefined;
    limit: number | undefined;
    get raw_datas() {
        return this.data.map(ele => ele.data);
    }

    constructor(api: ApiKitClient, query: Query, data: { data: any[], cursor: string | undefined, limit: number | undefined }) {
        this.api = api;
        this.query = query;
        this.data = data.data.map(ele => new InstanceResponse(ele, this.api, query.typename));
        this.cursor = data.cursor;
        this.limit = data.limit;
    }

    async refresh(): Promise<CollectionResponse> {
        return await this.api._get(this.query);
    }

    async next_page(): Promise<CollectionResponse> {
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