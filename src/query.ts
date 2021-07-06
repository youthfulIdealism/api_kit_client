import { ApiKitClient } from './index';
import { CollectionResponse } from './collection_response';

export class Query {
    typename: string;
    query_params: { [key: string]: number | string };
    api: ApiKitClient;

    constructor(typename: string, api: ApiKitClient) {
        this.typename = typename;
        this.query_params = {};
        this.api = api;
    }

    equal(field: string, value: number | string) {
        let new_query = this._clone();
        new_query.query_params[field] = value;
        return new_query;
    }

    less_than(field: string, value: number | string | Date) {
        let new_query = this._clone();
        if (value instanceof Date) { value = value.toISOString(); }
        new_query.query_params[field + '_lt'] = value;
        return new_query;
    }

    greater_than(field: string, value: number | string | Date) {
        let new_query = this._clone();
        if (value instanceof Date) { value = value.toISOString(); }
        new_query.query_params[field + '_gt'] = value;
        return new_query;
    }

    less_than_equal_to(field: string, value: number | string | Date) {
        let new_query = this._clone();
        if (value instanceof Date) { value = value.toISOString(); }
        new_query.query_params[field + '_lte'] = value;
        return new_query;
    }

    greater_than_equal_to(field: string, value: number | string | Date) {
        let new_query = this._clone();
        if (value instanceof Date) { value = value.toISOString(); }
        new_query.query_params[field + '_gte'] = value;
        return new_query;
    }

    cursor(value: string) {
        let new_query = this._clone();
        new_query.query_params.cursor = value;
        return new_query;
    }

    limit(value: number) {
        let new_query = this._clone();
        new_query.query_params.limit = value;
        return new_query;
    }

    async get(): Promise<CollectionResponse> {
        return await this.api._get(this);
    }

    _clone(): Query {
        let new_query = new Query(this.typename, this.api);

        for (let [key, value] of Object.entries(this.query_params)) {
            new_query.query_params[key] = value;
        }

        return new_query;
    }
} 