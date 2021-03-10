export default class ApiService {
    url: string;
    constructor(url: string);
    _get(path: string): Promise<Response>;
    _post(path: string, body: any): Promise<Response>;
}
