import Base from './Base';

export default class FlightRequestAPI extends Base {
    
    addFlightRequest = async (data) => {
        return this.sendRequest({
            path: '/api/v1/flight_request/create',
            method: 'POST',
            data
        })
    }

    getAllFlightRequest = async () => {
        return this.sendRequest({
            path: `/api/v1/flight_request/all`,
            method: 'GET',
        })
    }

    getFlightRequest = async (request_id) => {
        return this.sendRequest({
            path: `/api/v1/flight_request/${request_id}`,
            method: 'GET',
        })
    }
    
    updateFlightRequest = async (request_id, data) => {
        return this.sendRequest({
            path: `/api/v1/flight_request/${request_id}`,
            method: 'PUT',
            data
        })
    }

    deleteFlightRequest = async (request_id) => {
        return this.sendRequest({
            path: `/api/v1/flight_request/${request_id}`,
            method: 'DELETE',
        })
    }

}