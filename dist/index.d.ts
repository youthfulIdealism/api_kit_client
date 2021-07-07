import { Query } from './query';
import { InstanceResponse } from './instance_response';
import { CollectionResponse } from './collection_response';
export declare class ApiKitClient {
    url: string;
    constructor(url: string);
    query(typename: string): Query;
    _get(query: Query): Promise<CollectionResponse>;
    get(typename: string, id: string): Promise<InstanceResponse>;
    post(typename: string, data: any): Promise<InstanceResponse>;
    put(typename: string, id: string, data: any): Promise<InstanceResponse>;
    delete(typename: string, id: string): Promise<InstanceResponse>;
}
//# sourceMappingURL=index.d.ts.map