import Base from './Base';

export default class FormTypeAPI extends Base {
    
    // addFormType = async (data) => {
    //     return this.sendRequest({
    //         path: '/api/v1/form_type',
    //         method: 'POST',
    //         data
    //     })
    // }

    getAllFormType = async () => {
        return this.sendRequest({
            path: `/api/v1/form_type/all`,
            method: 'GET',
        })
    }

    getFormType = async (form_id) => {
        return this.sendRequest({
            path: `/api/v1/form_type/${form_id}`,
            method: 'GET',
        })
    }
    
    // updateFormType = async (form_id, data) => {
    //     return this.sendRequest({
    //         path: `/api/v1/form_type/${form_id}`,
    //         method: 'PUT',
    //         data
    //     })
    // }

    // deleteFormType = async (form_id) => {
    //     return this.sendRequest({
    //         path: `/api/v1/form_type/${form_id}`,
    //         method: 'DELETE',
    //     })
    // }

}