import Base from "./Base";

export default class BookingDetailsAPI extends Base {
    addBookingDetails = async(data) => {
        return this.sendRequest({
            path: `/api/v1/booking_details/create`,
            method: 'POST',
            data
        })
    }

    getAllBookingDetails = async() => {
        return this.sendRequest({
            path: `/api/v1/booking_details/all`,
            method: 'GET',
        })
    }

    getBookingDetails = async(id) => {
        return this.sendRequest({
            path: `/api/v1/booking_details/${id}`,
            method: 'GET',
        })
    }

    updateBookingDetails = async (id, data) => {
        return this.sendRequest({
            path: `/api/v1/booking_details/${id}`,
            method: 'PUT',
            data
        })
    }

    deleteBookingDetails = async (id) => {
        return this.sendRequest({
            path: `/api/v1/booking_details/${id}`,
            method: 'DELETE',
        })
    }
}