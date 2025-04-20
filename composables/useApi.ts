// composables/useApi.ts

import { FetchError } from 'ofetch';

export type ApiOptions = {
  showSuccessToast?: boolean;
  showDeleteToast?: boolean;
  showErrorToast?: boolean;
  customSuccessMessage?: string;
  customDeleteMessage?: string;
  customErrorMessage?: string;
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
};

export function useApi() {
  const defaultHeaders = {
    'client-platform': 'browser',
    'Content-Type': 'application/json',
  };

  /**
   * Generic API call function with error handling and toast notifications
   */
  async function apiCall<T>(
    url: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: object,
    options: ApiOptions = {}
  ): Promise<T | null> {
    const {
      showSuccessToast = true,
      showErrorToast = true,
      showDeleteToast = false,
      customDeleteMessage,
      customSuccessMessage,
      customErrorMessage,
      onSuccess,
      onError
    } = options;

    try {
      const response = await $fetch<T>(url, {
        method,
        headers: defaultHeaders,
        body: body && method !== 'GET' ? body : undefined,
      });

      // Handle success
      if (showSuccessToast) {
        useSuccessToast(customSuccessMessage || `Operation completed successfully`);
      }
      // Handle delete
      if (showDeleteToast && method === 'DELETE') {
        useDeleteToast(customDeleteMessage || `Record deleted successfully`);
      }
      
      if (onSuccess) {
        onSuccess(response);
      }

      return response;
    } catch (error) {
      // Handle errors
      if (error instanceof FetchError) {
        if (error.data?.error === 'Record already exists') {
          // Handle specific error case
          useErrorToast('This record already exists');
        } else if (showErrorToast) {
          useErrorToast(customErrorMessage || error.data?.error || 'An error occurred');
        }
      } else if (showErrorToast) {
        useErrorToast(customErrorMessage || 'An unexpected error occurred');
      }

      if (onError) {
        onError(error);
      }

      console.error('API call failed:', error);
      return null;
    }
  }

  return {
    apiCall
  };
}