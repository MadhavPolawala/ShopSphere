import { useNavigate } from 'react-router-dom';

const BackButton = ({ className = '' }) => {
    const navigate = useNavigate();
    return (
        <button
            onClick={() => navigate(-1)}
            className={`flex items-center gap-2 mb-1 p-2 text-lg font-bold text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group ${className}`}
        >
            <svg
                className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
                fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
        </button>
    );
};

export default BackButton;
