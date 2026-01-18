import Base from './Base';

export default class ProgressUpdateAPI extends Base {
    
    addProgressUpdate = async (data) => {
        return this.sendRequest({
            path: '/api/v1/progress_update/create',
            method: 'POST',
            data
        })
    }

    getAllProgressUpdate = async () => {
        return this.sendRequest({
            path: `/api/v1/progress_update/all`,
            method: 'GET',
        })
    }

    getProgressUpdate = async (update_id) => {
        return this.sendRequest({
            path: `/api/v1/progress_update/${update_id}`,
            method: 'GET',
        })
    }
    
    updateProgressUpdate = async (update_id, data) => {
        return this.sendRequest({
            path: `/api/v1/progress_update/${update_id}`,
            method: 'PUT',
            data
        })
    }

    deleteProgressUpdate = async (update_id) => {
        return this.sendRequest({
            path: `/api/v1/progress_update/${update_id}`,
            method: 'DELETE',
        })
    }

}