import Base from './Base';

export default class ApproverAPI extends Base {
    
    addApprover = async (approver_id, data) => {
        return this.sendRequest({
            path: '/api/v1/approver/create',
            method: 'POST',
            data
        })
    }

    getAllApprover = async () => {
        return this.sendRequest({
            path: `/api/v1/approver/all`,
            method: 'GET',
        })
    }

    getApprover = async (signal, approver_id) => {
        return this.sendRequest({
            path: `/api/v1/approver/${approver_id}`,
            method: 'GET',
            signal: signal,
        })
    }

    updateApprover = async (approver_id, data) => {
        return this.sendRequest({
            path: `/api/v1/approver/${approver_id}`,
            method: 'PUT',
            data
        })
    }

    deleteApprover = async (approver_id) => {
        return this.sendRequest({
            path: `/api/v1/approver/${approver_id}`,
            method: 'DELETE',
        })
    }

}