import Base from './Base';

export default class NotificationAPI extends Base {
    
    addNotification = async (data) => {
        return this.sendRequest({
            path: '/api/v1/notification/create',
            method: 'POST',
            data
        })
    }

    getAllNotification = async () => {
        return this.sendRequest({
            path: `/api/v1/notification/all`,
            method: 'GET',
        })
    }

    getNotification = async (notification_id) => {
        return this.sendRequest({
            path: `/api/v1/notification/${notification_id}`,
            method: 'GET',
        })
    }
    
    updateNotification = async (notification_id, data) => {
        return this.sendRequest({
            path: `/api/v1/notification/${notification_id}`,
            method: 'PUT',
            data
        })
    }

    deleteNotification = async (notification_id) => {
        return this.sendRequest({
            path: `/api/v1/notification/${notification_id}`,
            method: 'DELETE',
        })
    }

}