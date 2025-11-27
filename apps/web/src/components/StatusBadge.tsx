import React from 'react';
import { GenerationStatus, ContentStatus, ContentType } from '../types/content.types';

type BadgeType = 'generation' | 'content' | 'type';

interface StatusBadgeProps {
  type: BadgeType;
  value: GenerationStatus | ContentStatus | ContentType;
  isPolling?: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value, isPolling = false }) => {
  const getGenerationStatusClass = (status: GenerationStatus): string => {
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

  const getContentStatusClass = (): string => {
    return 'bg-gray-100 text-gray-800';
  };

  const getContentTypeClass = (): string => {
    return 'bg-primary-light text-primary-dark';
  };

  const getBadgeClass = (): string => {
    switch (type) {
      case 'generation':
        return getGenerationStatusClass(value as GenerationStatus);
      case 'content':
        return getContentStatusClass();
      case 'type':
        return getContentTypeClass();
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getBadgeClass()}`}
    >
      {value}
      {isPolling && ' (polling...)'}
    </span>
  );
};

export default StatusBadge;
