import { MdSentimentDissatisfied } from 'react-icons/md';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No data found',
  description = 'Try adjusting your search or filters',
  icon,
  className = '',
}) => {
  return (
    <div className={`text-center py-16 ${className}`}>
      {icon || (
        <MdSentimentDissatisfied className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      )}
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-gray-500">{description}</p>
    </div>
  );
};

export default EmptyState;
