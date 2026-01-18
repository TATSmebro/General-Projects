import PurposeOfTravelAPI from "../api/PurposeOfTravelAPI"; // adjust import as needed

export const fetchPurposeOfTravels = async () => {
    const response = await new PurposeOfTravelAPI().getAllPurposeOfTravel();
    if (!response.ok) {
        throw new Error(response.statusMessage || "Failed to fetch Purpose Of Travels");
    }
    return response.data;
};