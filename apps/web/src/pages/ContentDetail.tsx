import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contentApi } from '../api/content.api';
import { Content } from '../types/content.types';
import { useSocket } from '../hooks/useSocket';
import toast from 'react-hot-toast';
import { format, isValid, parseISO } from 'date-fns';
import { Layout, Loader, StatusBadge, Button, BackButton, ErrorMessage } from '../components';

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

  // use WebSocket for real-time updates
  const { isConnected } = useSocket({
    onGenerationStarted: (payload) => {
      // only update if this is the content we're viewing
      if (payload.contentId === id) {
        console.log('[ContentDetail] Generation started:', payload);
        toast.success('Content generation started!');
        // update content status
        setContent((prev) =>
          prev
            ? {
                ...prev,
                generationStatus: payload.status,
              }
            : null
        );
      }
    },
    onGenerationCompleted: (payload) => {
      // only update if this is the content we're viewing
      if (payload.contentId === id) {
        console.log('[ContentDetail] Generation completed:', payload);
        toast.success('Content generation completed!');
        // update content with generated text
        setContent((prev) =>
          prev
            ? {
                ...prev,
                generationStatus: payload.status,
                generatedText: payload.generatedText,
              }
            : null
        );
      }
    },
    onGenerationFailed: (payload) => {
      // only update if this is the content we're viewing
      if (payload.contentId === id) {
        console.log('[ContentDetail] Generation failed:', payload);
        toast.error('Content generation failed');
        // update content with failure reason
        setContent((prev) =>
          prev
            ? {
                ...prev,
                generationStatus: payload.status,
                failureReason: payload.failureReason,
              }
            : null
        );
      }
    },
  });

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

  if (isLoading) {
    return (
      <Layout showUserInfo={false}>
        <Loader text="Loading content..." fullScreen />
      </Layout>
    );
  }

  if (!content) {
    return null;
  }

  return (
    <Layout showUserInfo={false}>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <BackButton to="/content" />
        </div>

        {/* Content Card */}
        <div className="card">
          {/* Header Section */}
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">{content.title}</h2>
            <div className="flex gap-3 mb-3">
              <StatusBadge type="type" value={content.contentType} />
              <StatusBadge
                type="generation"
                value={content.generationStatus}
                isPolling={
                  (content.generationStatus === 'pending' ||
                    content.generationStatus === 'processing') &&
                  isConnected
                }
              />
              <StatusBadge type="content" value={content.status} />
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
              <ErrorMessage
                title="Generation failed"
                message={content.failureReason || 'Unknown error occurred'}
              />
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
                  <Button variant="primary" onClick={handlePublish} isLoading={isUpdating}>
                    Publish
                  </Button>
                ) : (
                  <Button variant="secondary" onClick={handleUnpublish} isLoading={isUpdating}>
                    Unpublish
                  </Button>
                )}
              </>
            )}
            <Button variant="danger" onClick={handleDelete} className="ml-auto">
              Delete
            </Button>
          </div>
        </div>

        {/* Job Info (for debugging) */}
        {content.jobId && (
          <div className="mt-6 card bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Job Information</h3>
            <p className="text-xs text-gray-600">Job ID: {content.jobId}</p>
            <p className={`text-xs mt-1 ${isConnected ? 'text-green-600' : 'text-gray-600'}`}>
              WebSocket: {isConnected ? 'Connected' : 'Disconnected'}
            </p>
            {(content.generationStatus === 'pending' ||
              content.generationStatus === 'processing') &&
              isConnected && (
                <p className="text-xs text-blue-600 mt-1">Listening for real-time updates...</p>
              )}
          </div>
        )}
      </main>
    </Layout>
  );
};

export default ContentDetail;
