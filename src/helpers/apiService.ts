

export default class ApiService {
    url: string
    constructor(url: string){
        this.url = url;
    }
    async _get(path: string){
        return await fetch(`${this.url}/${path}`)
    }
    async _post(path:string, body: any){
        return await fetch(`${this.url}/${path}`, {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        })
    }
}