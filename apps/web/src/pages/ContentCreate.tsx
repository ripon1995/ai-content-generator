import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { contentApi } from '../api/content.api';
import { ContentCreateRequest, ContentType } from '../types/content.types';
import toast from 'react-hot-toast';
import { Layout, BackButton, Button } from '../components';

// Validation schema
const contentSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  contentType: z.enum(['blog', 'product', 'social'], {
    message: 'Please select a content type',
  }),
  prompt: z.string().min(10, 'Prompt must be at least 10 characters'),
});

type ContentFormData = z.infer<typeof contentSchema>;

const ContentCreate: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContentFormData>({
    resolver: zodResolver(contentSchema),
  });

  const onSubmit = async (data: ContentFormData) => {
    setIsSubmitting(true);
    try {
      const createData: ContentCreateRequest = {
        title: data.title,
        contentType: data.contentType as ContentType,
        prompt: data.prompt,
      };

      const content = await contentApi.generate(createData);
      toast.success('Content generation queued successfully!');

      // Navigate to content detail page to show job status
      navigate(`/content/${content.id}`);
    } catch (error: any) {
      console.error('Failed to create content:', error);
      toast.error(error.response?.data?.message || 'Failed to queue content generation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout showUserInfo={false}>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <BackButton to="/content" />
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Content</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title Field */}
            <div>
              <label htmlFor="title" className="label">
                Title
              </label>
              <input
                id="title"
                type="text"
                {...register('title')}
                className={`input w-full ${errors.title ? 'border-danger' : ''}`}
                placeholder="Enter content title"
                disabled={isSubmitting}
              />
              {errors.title && <p className="error-text">{errors.title.message}</p>}
            </div>

            {/* Content Type Field */}
            <div>
              <label htmlFor="contentType" className="label">
                Content Type
              </label>
              <select
                id="contentType"
                {...register('contentType')}
                className={`input w-full ${errors.contentType ? 'border-danger' : ''}`}
                disabled={isSubmitting}
              >
                <option value="">Select a content type</option>
                <option value="blog">Blog Post</option>
                <option value="product">Product Description</option>
                <option value="social">Social Media Post</option>
              </select>
              {errors.contentType && <p className="error-text">{errors.contentType.message}</p>}
            </div>

            {/* Prompt Field */}
            <div>
              <label htmlFor="prompt" className="label">
                Prompt
              </label>
              <textarea
                id="prompt"
                {...register('prompt')}
                rows={6}
                className={`input w-full ${errors.prompt ? 'border-danger' : ''}`}
                placeholder="Describe what you want the AI to generate..."
                disabled={isSubmitting}
              />
              {errors.prompt && <p className="error-text">{errors.prompt.message}</p>}
              <p className="text-xs text-gray-500 mt-1">
                Be specific and detailed for better results
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
                Generate Content
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/content')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>

          {/* Info Box */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="text-sm font-medium text-blue-900 mb-2">How it works:</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Your content generation will be queued for processing</li>
              <li>You'll be redirected to the content detail page</li>
              <li>The page will automatically update when generation is complete</li>
              <li>Generation typically takes 30-60 seconds</li>
            </ul>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default ContentCreate;
