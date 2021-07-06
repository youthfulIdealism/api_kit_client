import { ApiKitClient } from './index';


export class InstanceResponse {
    data: any;
    api: ApiKitClient;
    typename: string;
    

    constructor(data: any, api: ApiKitClient, typename: string) {
        this.api = api;
        this.data = data;
        this.typename = typename;
    }

    async refresh(): Promise<InstanceResponse> {
        return await this.api.get(this.typename, this.data._id);
    }

    async post(data: any): Promise<InstanceResponse> {
        return await this.api.post(this.typename, this.data._id);
    }

    async put(data: any): Promise<InstanceResponse> {
        return await this.api.put(this.typename, this.data._id, data);
    }

    async delete(): Promise<InstanceResponse> {
        return await this.api.delete(this.typename, this.data._id);
    }
}