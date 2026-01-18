import Base from './Base';

export default class RequestAPI extends Base {
    
    addRequest = async (data) => {
        return this.sendRequest({
            path: '/api/v1/request/create',
            method: 'POST',
            data
        })
    }

    getAllRequest = async () => {
        return this.sendRequest({
            path: `/api/v1/request/all`,
            method: 'GET',
        })
    }

    getRequest = async (request_id) => {
        return this.sendRequest({
            path: `/api/v1/request/${request_id}`,
            method: 'GET',
        })
    }
    
    updateRequest = async (request_id, data) => {
        return this.sendRequest({
            path: `/api/v1/request/${request_id}`,
            method: 'PUT',
            data
        })
    }

    deleteRequest = async (request_id) => {
        return this.sendRequest({
            path: `/api/v1/request/${request_id}`,
            method: 'DELETE',
        })
    }
    
}