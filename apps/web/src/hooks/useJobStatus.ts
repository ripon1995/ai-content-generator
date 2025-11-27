import { useState, useEffect } from 'react';
import { contentApi } from '../api/content.api';
import { JobStatusResponse } from '../types/content.types';

interface UseJobStatusReturn {
  jobStatus: JobStatusResponse | null;
  isPolling: boolean;
  error: string | null;
}

export const useJobStatus = (
  jobId: string | undefined,
  shouldPoll: boolean
): UseJobStatusReturn => {
  const [jobStatus, setJobStatus] = useState<JobStatusResponse | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId || !shouldPoll) {
      setIsPolling(false);
      return;
    }

    setIsPolling(true);
    setError(null);

    const pollJobStatus = async () => {
      try {
        const status = await contentApi.getJobStatus(jobId);
        setJobStatus(status);

        // Stop polling if completed or failed
        if (status.status === 'completed' || status.status === 'failed') {
          setIsPolling(false);
          return false; // Signal to stop polling
        }
        return true; // Continue polling
      } catch (err) {
        console.error('Error polling job status:', err);
        setError('Failed to fetch job status');
        setIsPolling(false);
        return false; // Stop polling on error
      }
    };

    // Initial poll
    pollJobStatus();

    // Set up interval for subsequent polls
    const interval = setInterval(async () => {
      const shouldContinue = await pollJobStatus();
      if (!shouldContinue) {
        clearInterval(interval);
      }
    }, 5000); // Poll every 5 seconds

    // Cleanup function
    return () => {
      clearInterval(interval);
      setIsPolling(false);
    };
  }, [jobId, shouldPoll]);

  return { jobStatus, isPolling, error };
};
