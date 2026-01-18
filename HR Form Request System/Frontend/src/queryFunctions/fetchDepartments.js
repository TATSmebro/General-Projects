import DepartmentAPI from "../api/DepartmentAPI"; // adjust import as needed

export const fetchDepartments = async () => {
    const response = await new DepartmentAPI().getAllDepartments();
    if (!response.ok) {
        throw new Error(response.statusMessage || "Failed to fetch Department");
    }
    return response.data;
};