import Base from './Base';

export default class PurposeOfTravelAPI extends Base {
    
    // addPurposeOfTravel = async (data) => {
    //     return this.sendRequest({
    //         path: '/api/v1/purpose_of_travel/create',
    //         method: 'POST',
    //         data
    //     })
    // }

    getAllPurposeOfTravel = async () => {
        return this.sendRequest({
            path: `/api/v1/purpose_of_travel/all`,
            method: 'GET',
        })
    }

    // getPurposeOfTravel = async (purpose_id) => {
    //     return this.sendRequest({
    //         path: `/api/v1/purpose_of_travel/${purpose_id}`,
    //         method: 'GET',
    //     })
    // }
    
    // updatePurposeOfTravel = async (purpose_id, data) => {
    //     return this.sendRequest({
    //         path: `/api/v1/purpose_of_travel/${purpose_id}`,
    //         method: 'PUT',
    //         data
    //     })
    // }

    // deletePurposeOfTravel = async (purpose_id) => {
    //     return this.sendRequest({
    //         path: `/api/v1/purpose_of_travel/${purpose_id}`,
    //         method: 'DELETE',
    //     })
    // }

}