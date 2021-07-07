import { ApiKitClient } from './index';
import { InstanceResponse } from './instance_response';
import { Query } from './query';
export declare class CollectionResponse {
    api: ApiKitClient;
    data: InstanceResponse[];
    query: Query;
    cursor: string | undefined;
    limit: number | undefined;
    get raw_datas(): any[];
    constructor(api: ApiKitClient, query: Query, data: {
        data: any[];
        cursor: string | undefined;
        limit: number | undefined;
    });
    refresh(): Promise<CollectionResponse>;
    next_page(): Promise<CollectionResponse>;
}
//# sourceMappingURL=collection_response.d.ts.map