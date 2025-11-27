import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contentApi } from '../api/content.api';
import { Content, ContentType, ContentStatus } from '../types/content.types';
import { useAuth } from '../contexts/AuthContext';
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

const ContentList: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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

  const handleLogout = () => {
    logout();
    navigate('/login');
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">AI Content Generator</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user?.firstName} {user?.lastName}
            </span>
            <button onClick={handleLogout} className="btn btn-danger">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header with Create Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">My Content</h2>
          <button onClick={() => navigate('/content/new')} className="btn btn-primary">
            + Create New Content
          </button>
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
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">Loading content...</p>
          </div>
        ) : contents.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600 mb-4">No content found</p>
            <button onClick={() => navigate('/content/new')} className="btn btn-primary">
              Create Your First Content
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {contents.map((content) => (
              <div key={content.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{content.title}</h3>
                    <div className="flex gap-3 mb-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-light text-primary-dark">
                        {content.contentType}
                      </span>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                          content.generationStatus
                        )}`}
                      >
                        {content.generationStatus}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {content.status}
                      </span>
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
    </div>
  );
};

export default ContentList;
