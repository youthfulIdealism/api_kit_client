import { Query } from './query';
import { InstanceResponse } from './instance_response';
import { CollectionResponse } from './collection_response';
export declare class ApiKitClient {
    url: string;
    ky_or_got: any;
    http_lib: 'ky' | 'got';
    _auth_token: string | undefined;
    constructor(url: string, http_lib: 'ky' | 'got', ky_or_got: any, auth_token: string | undefined);
    query(typename: string): Query;
    _get(query: Query): Promise<CollectionResponse>;
    get(typename: string, id: string): Promise<InstanceResponse>;
    post(typename: string, data: any): Promise<InstanceResponse>;
    put(typename: string, id: string, data: any): Promise<InstanceResponse>;
    delete(typename: string, id: string): Promise<InstanceResponse>;
    create_user(username: string, password: string): Promise<any>;
    create_user_and_log_in(username: string, password: string): Promise<{
        user: any;
        token: any;
    }>;
    login(username: string, password: string): Promise<any>;
    set_token(token: string): Promise<void>;
    _gen_ky_got_params(body: any): {
        json: any;
        headers: {};
    } | undefined;
    _gen_auth_header(): {};
}
//# sourceMappingURL=index.d.ts.map