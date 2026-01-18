import Base from "./Base";

export default class DepartmentAPI extends Base {
    getAllDepartments = async() => {
        return this.sendRequest({
            path: `/api/v1/department/all`,
            method: 'GET',
        })
    }

    getDepartmentById = async(id) => {
        return this.sendRequest({
            path: `/api/v1/department/${id}`,
            method: 'GET',
        })
    }
}