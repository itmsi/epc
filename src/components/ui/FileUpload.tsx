import React, { useState, useEffect } from 'react';
import { MdImage, MdUpload, MdCloudUpload, MdClose } from 'react-icons/md';
import toast from 'react-hot-toast';
import Label from '@/components/form/Label';

interface FileUploadProps {
    id: string;
    name: string;
    label: string;
    accept: string;
    icon?: 'image' | 'upload' | 'cloud';
    acceptedFormats: string[];
    maxSize?: number; // in MB
    currentFile?: File | null;
    onFileChange: (file: File | null) => void;
    validationError?: string;
    required?: boolean;
    disabled?: boolean;
    description?: string;
    className?: string;
    showPreview?: boolean;          // Show file preview
    previewSize?: 'sm' | 'md' | 'lg'; // Preview size
}

interface DragState {
    isDragging: boolean;
}

interface PreviewState {
    url: string | null;
}

const FileUpload: React.FC<FileUploadProps> = ({
    id,
    name,
    label,
    accept,
    icon = 'upload',
    acceptedFormats,
    maxSize = 10, // 10MB default
    currentFile,
    onFileChange,
    validationError,
    required = false,
    disabled = false,
    description,
    className = '',
    showPreview = true,
    previewSize = 'md'
}) => {
    const [dragState, setDragState] = useState<DragState>({ isDragging: false });
    const [previewState, setPreviewState] = useState<PreviewState>({ 
        url: null
    });

    // Create preview URL when file changes
    useEffect(() => {
        if (currentFile && isImageFile(currentFile)) {
            const url = URL.createObjectURL(currentFile);
            setPreviewState(prev => ({ ...prev, url }));
            
            // Cleanup previous URL
            return () => {
                if (previewState.url && previewState.url.startsWith('blob:')) {
                    URL.revokeObjectURL(previewState.url);
                }
            };
        } else {
            setPreviewState(prev => ({ ...prev, url: null }));
        }
    }, [currentFile]);

    // Check if file is an image
    const isImageFile = (file: File): boolean => {
        return file.type.startsWith('image/') || file.name.toLowerCase().endsWith('.svg');
    };

    // Get preview size classes
    const getPreviewSizeClasses = () => {
        switch (previewSize) {
            case 'sm': return 'w-16 h-16';
            case 'lg': return 'w-full';
            default: return 'w-24 h-24';
        }
    };

    // Handle remove file
    const handleRemoveFile = () => {
        if (previewState.url && previewState.url.startsWith('blob:')) {
            URL.revokeObjectURL(previewState.url);
        }
        setPreviewState({ url: null });
        onFileChange(null);
    };

    // Get icon component
    const getIcon = () => {
        const iconProps = { className: "mx-auto h-12 w-12 text-gray-400" };
        switch (icon) {
            case 'image':
                return <MdImage {...iconProps} />;
            case 'cloud':
                return <MdCloudUpload {...iconProps} />;
            default:
                return <MdUpload {...iconProps} />;
        }
    };

    // Validate file
    const validateFile = (file: File): boolean => {
        // Check file size
        if (file.size > maxSize * 1024 * 1024) {
            toast.error(`File size must be less than ${maxSize}MB`);
            return false;
        }

        // Check file type
        const fileExtension = file.name.toLowerCase().split('.').pop();
        const mimeTypeValid = acceptedFormats.some(format => 
            file.type.includes(format) || file.name.toLowerCase().endsWith(format)
        );
        const extensionValid = acceptedFormats.some(format => 
            format.includes(fileExtension || '')
        );

        if (!mimeTypeValid && !extensionValid) {
            const formatsText = acceptedFormats.join(', ');
            toast.error(`Please select a valid file. Accepted formats: ${formatsText}`);
            return false;
        }

        return true;
    };

    // Handle file selection
    const handleFileChange = (file: File | null) => {
        if (file && !validateFile(file)) {
            return;
        }
        
        onFileChange(file);
        
        if (file) {
            toast.success('File uploaded successfully!');
        }
    };

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        handleFileChange(file);
    };

    // Drag & Drop handlers
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) {
            setDragState({ isDragging: true });
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragState({ isDragging: false });
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragState({ isDragging: false });

        if (disabled) return;

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];
            handleFileChange(file);
        }
    };

    // Generate accepted formats text
    const getAcceptedFormatsText = () => {
        return acceptedFormats.map(format => format.toUpperCase()).join(', ');
    };

    return (
        <div className={`space-y-2 ${className}`}>
            <Label htmlFor={id} className='font-secondary'>
                {label} {required && <span className="text-red-500">*</span>}
            </Label>
            
            <div
                className={`
                    relative flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-all duration-200
                    ${disabled 
                        ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60' 
                        : dragState.isDragging
                            ? 'border-blue-400 bg-blue-50 shadow-sm'
                            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    }
                `}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div className="space-y-2 text-center">
                    {/* Icon */}
                    <div className={`transition-colors ${dragState.isDragging ? 'text-blue-500' : ''}`}>
                        {getIcon()}
                    </div>

                    {/* Upload Text */}
                    <div className="flex text-sm text-gray-600">
                        <label
                            htmlFor={id}
                            className={`
                                relative font-medium rounded-md focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500
                                ${disabled 
                                    ? 'text-gray-400 cursor-not-allowed' 
                                    : 'cursor-pointer text-blue-600 hover:text-blue-500'
                                }
                            `}
                        >
                            <span>
                                {currentFile ? 'Change file' : `Upload ${getAcceptedFormatsText()} file`}
                            </span>
                            <input
                                id={id}
                                name={name}
                                type="file"
                                accept={accept}
                                disabled={disabled}
                                className="sr-only"
                                onChange={handleInputChange}
                            />
                        </label>
                        <p className={`pl-1 ${disabled ? 'text-gray-400' : ''}`}>
                            or drag and drop
                        </p>
                    </div>

                    {/* File Info */}
                    <div className="space-y-1">
                        <p className="text-xs text-gray-500">
                            {description || `${getAcceptedFormatsText()} files only, max ${maxSize}MB`}
                        </p>
                        
                        {/* Current File Display */}
                        {currentFile && (
                            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                                <span className="mr-1">✓</span>
                                <span className="font-medium">{currentFile.name}</span>
                                <span className="ml-2 text-xs text-green-600">
                                    ({(currentFile.size / 1024 / 1024).toFixed(2)} MB)
                                </span>
                            </div>
                        )}

                        {/* Drag State Feedback */}
                        {dragState.isDragging && !disabled && (
                            <p className="text-sm text-blue-600 font-medium animate-pulse">
                                Drop file here to upload
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Validation Error */}
            {validationError && (
                <p className="text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {validationError}
                </p>
            )}

            {/* File Preview Section */}
            {showPreview && currentFile && previewState.url && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-900">Preview</h4>
                        <button
                            onClick={handleRemoveFile}
                            className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                            disabled={disabled}
                        >
                            <MdClose className="w-4 h-4" />
                            Remove
                        </button>
                    </div>

                    <div className="space-y-2 gap-4 grid-cols-1">
                        {/* Image Preview */}
                        <div className={`${getPreviewSizeClasses()} rounded-lg overflow-hidden border border-gray-300 bg-white shadow-sm relative group `}>
                            <img
                                src={previewState.url}
                                alt="Preview"
                                className="w-full h-full"
                            />
                        </div>

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                            <div className="space-y-2">
                                <div>
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {currentFile.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {currentFile.type || 'Unknown type'}
                                    </p>
                                </div>
                                
                                <div className="text-xs text-gray-500 space-y-1">
                                    <p>Size: {(currentFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileUpload;