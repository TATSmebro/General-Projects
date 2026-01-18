import Base from './Base';

export default class UserProfileAPI extends Base {
    
    addUserProfile = async (id, data) => {
        return this.sendRequest({
            path: '/api/v1/user_profile/create',
            method: 'POST',
            data
        })
    }

    getAllUserProfile = async () => {
        return this.sendRequest({
            path: `/api/v1/user_profile/all`,
            method: 'GET',
        })
    }

    getUserProfile = async (id) => {
        return this.sendRequest({
            path: `/api/v1/user_profile/${id}`,
            method: 'GET',
        })
    }

    updateUserProfile = async (id, data) => {
        return this.sendRequest({
            path: `/api/v1/user_profile/${id}`,
            method: 'PUT',
            data
        })
    }

    deleteUserProfile = async (id) => {
        return this.sendRequest({
            path: `/api/v1/user_profile/${id}`,
            method: 'DELETE',
        })
    }

}