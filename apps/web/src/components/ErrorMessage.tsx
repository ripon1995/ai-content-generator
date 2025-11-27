import React from 'react';

interface ErrorMessageProps {
  message: string;
  title?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, title = 'Error' }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4">
      <p className="text-red-800 font-medium">{title}</p>
      <p className="text-sm text-red-600 mt-2">{message}</p>
    </div>
  );
};

export default ErrorMessage;
