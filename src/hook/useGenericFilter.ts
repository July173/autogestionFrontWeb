import { useState, useEffect } from 'react';

interface FilterOption {
    id: number;
    name: string;
}

interface UseGenericFilterReturn {
    options: FilterOption[];
    loading: boolean;
    error: string;
    selectedValue: string | number;
    setSelectedValue: (value: string | number) => void;
}

/**
 * Generic hook for handling filter options from API endpoints.
 * Fetches filter options from a specified API endpoint and manages selection state.
 * Provides loading states, error handling, and value selection management.
 * 
 * @param apiEndpoint - The API endpoint URL to fetch filter options from
 * @param initialValue - Initial selected value for the filter
 * @returns Object containing options array, loading state, error state, and selection management
 */
export function useGenericFilter(apiEndpoint: string, initialValue: string | number = ""): UseGenericFilterReturn {
    const [options, setOptions] = useState<FilterOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");
    const [selectedValue, setSelectedValue] = useState<string | number>(initialValue);

    useEffect(() => {
        const fetchOptions = async () => {
            setLoading(true);
            setError("");
            try {
                const response = await fetch(apiEndpoint);
                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }
                const data = await response.json();
                setOptions(data);
            } catch (err) {
                setError("Error al cargar las opciones");
                console.error("Error fetching filter options:", err);
            } finally {
                setLoading(false);
            }
        };

        if (apiEndpoint) {
            fetchOptions();
        }
    }, [apiEndpoint]);

    return {
        options,
        loading,
        error,
        selectedValue,
        setSelectedValue
    };
}
