import ApproverAPI from "../api/ApproverAPI"; // adjust import as needed

export const fetchApprovers = async () => {
    const response = await new ApproverAPI().getAllApprover();
    if (!response.ok) {
        throw new Error(response.statusMessage || "Failed to fetch Approvers");
    }
    return response.data;
};