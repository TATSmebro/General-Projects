import Base from './Base';

export default class StatusTypeAPI extends Base {
    
    addStatusType = async (data) => {
        return this.sendRequest({
            path: '/api/v1/status_type',
            method: 'POST',
            data
        })
    }

    getAllStatusType = async () => {
        return this.sendRequest({
            path: `/api/v1/status_type/all`,
            method: 'GET',
        })
    }

    getStatusType = async (status_id) => {
        return this.sendRequest({
            path: `/api/v1/status_type/${status_id}`,
            method: 'GET',
        })
    }
    
    updateStatusType = async (status_id, data) => {
        return this.sendRequest({
            path: `/api/v1/status_type/${status_id}`,
            method: 'PUT',
            data
        })
    }

    deleteStatusType = async (status_id) => {
        return this.sendRequest({
            path: `/api/v1/status_type/${status_id}`,
            method: 'DELETE',
        })
    }

}