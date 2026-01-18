import { useQuery } from "@tanstack/react-query";
import { fetchDepartments } from "./fetchDepartments";
import { fetchFormTypes } from "./fetchFormTypes";
import { fetchStatusTypes } from "./fetchStatusTypes";
import { fetchPurposeOfTravels } from "./fetchPurposeOfTravels";
import { fetchApprovers } from "./fetchApprovers";

// Departments
export const useDepartments = () =>
    useQuery({
        queryFn: fetchDepartments,
        queryKey: ["departments"],
        staleTime: Infinity,
    });

// Form Types
export const useFormTypes = () =>
    useQuery({
        queryFn: fetchFormTypes,
        queryKey: ["formTypes"],
        staleTime: Infinity,
    });

// Status Types
export const useStatusTypes = () =>
    useQuery({
        queryFn: fetchStatusTypes,
        queryKey: ["statusTypes"],
        staleTime: Infinity,
    });

// Purposes of Travel
export const usePurposesOfTravel = () =>
    useQuery({
        queryFn: fetchPurposeOfTravels,
        queryKey: ["purposes"],
        staleTime: Infinity,
    });

// Approvers
export const useApprovers = () =>
    useQuery({
        queryFn: fetchApprovers,
        queryKey: ["approvers"],
        staleTime: Infinity,
    });
