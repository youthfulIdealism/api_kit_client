import { ApiKitClient } from './index';
import { CollectionResponse } from './collection_response';
export declare class Query {
    typename: string;
    query_params: {
        [key: string]: number | string;
    };
    api: ApiKitClient;
    constructor(typename: string, api: ApiKitClient);
    equal(field: string, value: number | string): Query;
    less_than(field: string, value: number | string | Date): Query;
    greater_than(field: string, value: number | string | Date): Query;
    less_than_equal_to(field: string, value: number | string | Date): Query;
    greater_than_equal_to(field: string, value: number | string | Date): Query;
    cursor(value: string): Query;
    limit(value: number): Query;
    get(): Promise<CollectionResponse>;
    _clone(): Query;
}
//# sourceMappingURL=query.d.ts.map