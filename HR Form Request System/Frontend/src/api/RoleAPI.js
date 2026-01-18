import Base from './Base';

export default class RoleAPI extends Base {
    
    addRole = async (id, data) => {
        return this.sendRequest({
            path: '/api/v1/role/create',
            method: 'POST',
            data
        })
    }

    getAllRole = async () => {
        return this.sendRequest({
            path: `/api/v1/role/all`,
            method: 'GET',
        })
    }

    getRole = async (id) => {
        return this.sendRequest({
            path: `/api/v1/role/${id}`,
            method: 'GET',
        })
    }

    updateRole = async (id, data) => {
        return this.sendRequest({
            path: `/api/v1/role/${id}`,
            method: 'PUT',
            data
        })
    }

    deleteRole = async (id) => {
        return this.sendRequest({
            path: `/api/v1/role/${id}`,
            method: 'DELETE',
        })
    }

}