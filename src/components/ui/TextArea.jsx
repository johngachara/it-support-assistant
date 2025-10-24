import { forwardRef } from 'react';

const TextArea = forwardRef(({
                                 label,
                                 error,
                                 helperText,
                                 className = '',
                                 rows = 4,
                                 required = false,
                                 ...props
                             }, ref) => {
    const textAreaClasses = `
    w-full px-3 py-2 border rounded-lg text-gray-900 dark:text-white 
    bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600
    focus:ring-2 focus:ring-blue-500 focus:border-transparent
    disabled:opacity-50 disabled:cursor-not-allowed resize-vertical
    ${error ? 'border-red-500 focus:ring-red-500' : ''}
    ${className}
  `;

    return (
        <div className="space-y-1">
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <textarea
                ref={ref}
                rows={rows}
                className={textAreaClasses}
                {...props}
            />
            {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
            {helperText && !error && (
                <p className="text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
            )}
        </div>
    );
});

TextArea.displayName = 'TextArea';

export default TextArea;