import useSWR from "swr";
import { fetcher } from "../../lib/fetcher";

export const useVerificationStatus = () => {
  const { data, error, isLoading } = useSWR<{ verified: boolean }>(
    "/api/verification-status", // Added '/api' prefix
    fetcher,
    {
      // Configure SWR to handle optional authentication
      // Don't treat 401 as an error that needs to be displayed to user
      // Just means user is not logged in or verification isn't complete
      onError: (err) => {
        console.warn('Verification status check failed:', err);
      },
      // Retry on 401 errors to handle cases where token is temporarily invalid
      errorRetryCount: 1,
      shouldRetryOnError: (err) => {
        // Don't retry on 401 errors as that indicates authentication issues
        return err?.response?.status !== 401;
      }
    }
  );

  return {
    isVerified: data?.verified ?? false, // Default to false if no data
    isLoading,
    isError: error && error?.response?.status !== 401, // Don't treat 401 as error
    rawError: error, // Keep raw error for debugging
  };
};