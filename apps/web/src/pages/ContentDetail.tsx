import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contentApi } from '../api/content.api';
import { Content } from '../types/content.types';
import { useJobStatus } from '../hooks/useJobStatus';
import toast from 'react-hot-toast';
import { format, isValid, parseISO } from 'date-fns';

// Helper function to safely format dates
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'N/A';

  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    if (!isValid(date)) return 'Invalid date';
    return format(date, 'MMM dd, yyyy HH:mm');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

const ContentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<Content | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Determine if we should poll for job status
  const shouldPoll =
    content?.generationStatus === 'pending' || content?.generationStatus === 'processing';

  // Use job status polling hook
  const { jobStatus, isPolling } = useJobStatus(content?.jobId, shouldPoll);

  // Fetch content details
  const fetchContent = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      const data = await contentApi.getById(id);
      setContent(data);
    } catch (error) {
      console.error('Failed to fetch content:', error);
      toast.error('Failed to load content');
      navigate('/content');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [id]);

  // Update content when job status changes
  useEffect(() => {
    if (jobStatus && jobStatus.status === 'completed') {
      toast.success('Content generation completed!');
      fetchContent(); // Refresh content to get the generated text
    } else if (jobStatus && jobStatus.status === 'failed') {
      toast.error('Content generation failed');
      fetchContent();
    }
  }, [jobStatus]);

  const handlePublish = async () => {
    if (!content) return;

    setIsUpdating(true);
    try {
      await contentApi.update(content.id, { status: 'published' });
      toast.success('Content published successfully!');
      fetchContent();
    } catch (error) {
      console.error('Failed to publish content:', error);
      toast.error('Failed to publish content');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUnpublish = async () => {
    if (!content) return;

    setIsUpdating(true);
    try {
      await contentApi.update(content.id, { status: 'draft' });
      toast.success('Content unpublished successfully!');
      fetchContent();
    } catch (error) {
      console.error('Failed to unpublish content:', error);
      toast.error('Failed to unpublish content');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!content) return;

    if (!window.confirm('Are you sure you want to delete this content?')) {
      return;
    }

    try {
      await contentApi.delete(content.id);
      toast.success('Content deleted successfully!');
      navigate('/content');
    } catch (error) {
      console.error('Failed to delete content:', error);
      toast.error('Failed to delete content');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading content...</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">AI Content Generator</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate('/content')}
            className="text-primary hover:text-primary-dark font-medium flex items-center gap-2"
          >
            ← Back to Content List
          </button>
        </div>

        {/* Content Card */}
        <div className="card">
          {/* Header Section */}
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">{content.title}</h2>
            <div className="flex gap-3 mb-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-light text-primary-dark">
                {content.contentType}
              </span>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(
                  content.generationStatus
                )}`}
              >
                {content.generationStatus}
                {isPolling && ' (polling...)'}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                {content.status}
              </span>
            </div>
            <p className="text-sm text-gray-500">Created: {formatDate(content.createdAt)}</p>
          </div>

          {/* Prompt Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Prompt</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
              <p className="text-gray-700">{content.prompt}</p>
            </div>
          </div>

          {/* Generated Content Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Generated Content</h3>
            {content.generationStatus === 'pending' || content.generationStatus === 'processing' ? (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-6 text-center">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
                <p className="text-blue-800 font-medium">
                  {content.generationStatus === 'pending'
                    ? 'Waiting in queue...'
                    : 'Generating content...'}
                </p>
                <p className="text-sm text-blue-600 mt-2">
                  This usually takes 30-60 seconds. This page will update automatically.
                </p>
              </div>
            ) : content.generationStatus === 'failed' ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800 font-medium">Generation failed</p>
                {content.failureReason && (
                  <p className="text-sm text-red-600 mt-2">Reason: {content.failureReason}</p>
                )}
              </div>
            ) : content.generatedText ? (
              <div className="bg-white border border-gray-200 rounded-md p-4">
                <p className="text-gray-800 whitespace-pre-wrap">{content.generatedText}</p>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <p className="text-gray-500 italic">No content generated yet</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            {content.generationStatus === 'completed' && (
              <>
                {content.status === 'draft' ? (
                  <button onClick={handlePublish} className="btn btn-primary" disabled={isUpdating}>
                    {isUpdating ? 'Publishing...' : 'Publish'}
                  </button>
                ) : (
                  <button
                    onClick={handleUnpublish}
                    className="btn btn-secondary"
                    disabled={isUpdating}
                  >
                    {isUpdating ? 'Unpublishing...' : 'Unpublish'}
                  </button>
                )}
              </>
            )}
            <button onClick={handleDelete} className="btn btn-danger ml-auto">
              Delete
            </button>
          </div>
        </div>

        {/* Job Info (for debugging) */}
        {content.jobId && (
          <div className="mt-6 card bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Job Information</h3>
            <p className="text-xs text-gray-600">Job ID: {content.jobId}</p>
            {isPolling && (
              <p className="text-xs text-blue-600 mt-1">
                Polling for status updates every 5 seconds...
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ContentDetail;
