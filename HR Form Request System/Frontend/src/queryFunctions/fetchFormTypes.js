import FormTypeAPI from "../api/FormTypeAPI"; // adjust import as needed

export const fetchFormTypes = async () => {
    const response = await new FormTypeAPI().getAllFormType();
    if (!response.ok) {
        throw new Error(response.statusMessage || "Failed to fetch Form Types");
    }
    return response.data;
};