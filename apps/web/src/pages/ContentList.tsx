import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contentApi } from '../api/content.api';
import { Content, ContentType, ContentStatus } from '../types/content.types';
import toast from 'react-hot-toast';
import { format, isValid, parseISO } from 'date-fns';
import { Layout, Loader, StatusBadge, Button, EmptyState } from '../components';

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

const ContentList: React.FC = () => {
  const navigate = useNavigate();
  const [contents, setContents] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterType, setFilterType] = useState<ContentType | ''>('');
  const [filterStatus, setFilterStatus] = useState<ContentStatus | ''>('');

  const fetchContents = async () => {
    setIsLoading(true);
    try {
      const params: any = { page: currentPage, limit: 10 };
      if (filterType) params.contentType = filterType;
      if (filterStatus) params.status = filterStatus;

      const response = await contentApi.getAll(params);
      setContents(response.contents);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Failed to fetch contents:', error);
      toast.error('Failed to load content');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, [currentPage, filterType, filterStatus]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this content?')) {
      return;
    }

    try {
      await contentApi.delete(id);
      toast.success('Content deleted successfully');
      fetchContents();
    } catch (error) {
      console.error('Failed to delete content:', error);
      toast.error('Failed to delete content');
    }
  };

  return (
    <Layout>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header with Create Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">My Content</h2>
          <Button variant="primary" onClick={() => navigate('/content/new')}>
            + Create New Content
          </Button>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="filterType" className="label">
                Content Type
              </label>
              <select
                id="filterType"
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value as ContentType | '');
                  setCurrentPage(1);
                }}
                className="input w-full"
              >
                <option value="">All Types</option>
                <option value="blog">Blog</option>
                <option value="product">Product</option>
                <option value="social">Social</option>
              </select>
            </div>
            <div className="flex-1">
              <label htmlFor="filterStatus" className="label">
                Status
              </label>
              <select
                id="filterStatus"
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value as ContentStatus | '');
                  setCurrentPage(1);
                }}
                className="input w-full"
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content List */}
        {isLoading ? (
          <Loader text="Loading content..." />
        ) : contents.length === 0 ? (
          <EmptyState
            title="No content found"
            description="Start creating amazing AI-generated content"
            actionLabel="Create Your First Content"
            onAction={() => navigate('/content/new')}
          />
        ) : (
          <div className="grid gap-4">
            {contents.map((content) => (
              <div key={content.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{content.title}</h3>
                    <div className="flex gap-3 mb-3">
                      <StatusBadge type="type" value={content.contentType} />
                      <StatusBadge type="generation" value={content.generationStatus} />
                      <StatusBadge type="content" value={content.status} />
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Prompt:</span> {content.prompt}
                    </p>
                    <p className="text-xs text-gray-500">
                      Created: {formatDate(content.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => navigate(`/content/${content.id}`)}
                      className="btn btn-secondary text-sm px-3 py-1"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(content.id)}
                      className="btn btn-danger text-sm px-3 py-1"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </Layout>
  );
};

export default ContentList;
