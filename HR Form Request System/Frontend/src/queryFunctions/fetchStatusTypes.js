import StatusTypeAPI from "../api/StatusTypeAPI"; // adjust import as needed

export const fetchStatusTypes = async () => {
    const response = await new StatusTypeAPI().getAllStatusType();
    if (!response.ok) {
        throw new Error(response.statusMessage || "Failed to fetch StatusTypes");
    }
    return response.data;
};