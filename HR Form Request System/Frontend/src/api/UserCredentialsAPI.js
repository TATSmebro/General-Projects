import Base from './Base';

export default class UserCredentialsAPI extends Base {
    
    addUserCredentials = async (data) => {
        return this.sendRequest({
            path: '/api/v1/user_credentials/create',
            method: 'POST',
            data
        })
    }

    getAllUserCredentials = async () => {
        return this.sendRequest({
            path: `/api/v1/user_credentials/all`,
            method: 'GET',
        })
    }

    getUserCredentials = async (id) => {
        return this.sendRequest({
            path: `/api/v1/user_credentials/${id}`,
            method: 'GET',
        })
    }

    updateUserCredentials = async (id, data) => {
        return this.sendRequest({
            path: `/api/v1/user_credentials/${id}`,
            method: 'PUT',
            data
        })
    }

    deleteUserCredentials = async (id) => {
        return this.sendRequest({
            path: `/api/v1/user_credentials/${id}`,
            method: 'DELETE',
        })
    }

}