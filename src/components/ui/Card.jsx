const Card = ({ children, className = '', padding = true, hover = false }) => {
    const cardClasses = `
    bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700
    shadow-sm transition-all duration-200
    ${hover ? 'hover:shadow-md hover:scale-[1.02]' : ''}
    ${padding ? 'p-6' : ''}
    ${className}
  `;

    return (
        <div className={cardClasses}>
            {children}
        </div>
    );
};

export default Card;