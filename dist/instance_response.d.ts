import { ApiKitClient } from './index';
export declare class InstanceResponse {
    data: any;
    api: ApiKitClient;
    typename: string;
    constructor(data: any, api: ApiKitClient, typename: string);
    refresh(): Promise<InstanceResponse>;
    post(data: any): Promise<InstanceResponse>;
    put(data: any): Promise<InstanceResponse>;
    delete(): Promise<InstanceResponse>;
}
//# sourceMappingURL=instance_response.d.ts.map