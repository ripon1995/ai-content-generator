import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  fullWidth?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  fullWidth = false,
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const widthClass = fullWidth ? 'w-full' : '';
  const combinedClass = `${baseClass} ${variantClass} ${widthClass} ${className}`.trim();

  return (
    <button className={combinedClass} disabled={disabled || isLoading} {...props}>
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
