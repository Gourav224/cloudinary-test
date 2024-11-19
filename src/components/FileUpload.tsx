"use client";

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';

interface UploadResponse {
    url: string;
    public_id: string;
}

export default function FileUpload() {
    const [uploading, setUploading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<UploadResponse[]>([]);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        setUploading(true);
        setError(null);

        try {
            const uploadPromises = acceptedFiles.map(async (file) => {
                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error('Upload failed');
                }

                return response.json();
            });

            const results = await Promise.all(uploadPromises);
            setUploadedFiles(prev => [...prev, ...results]);
        } catch (err) {
            console.error('Upload error:', err);
            setError('Failed to upload files. Please try again.');
        } finally {
            setUploading(false);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
            'application/pdf': ['.pdf']
        },
        maxSize: 10 * 1024 * 1024, // 10MB
        multiple: true
    });

    return (
        <div className="w-full max-w-2xl mx-auto p-4">
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-400 bg-blue-900/20' : 'border-gray-600 hover:border-gray-500'}`}
            >
                <input {...getInputProps()} />
                <div className="space-y-4">
                    <div className="text-gray-300">
                        {isDragActive ? (
                            <p>Drop the files here...</p>
                        ) : (
                            <p>Drag & drop files here, or click to select files</p>
                        )}
                    </div>
                    <div className="text-sm text-gray-400">
                        Supported formats: JPEG, PNG, GIF, WEBP, PDF (max 10MB)
                    </div>
                </div>
            </div>

            {uploading && (
                <div className="mt-4 text-center text-blue-400">
                    Uploading...
                </div>
            )}

            {error && (
                <div className="mt-4 text-center text-red-400">
                    {error}
                </div>
            )}

            {uploadedFiles.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4 text-gray-200">Uploaded Files</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {uploadedFiles.map((file, index) => (
                            <div key={index} className="relative aspect-square">
                                {file.url.endsWith('.pdf') ? (
                                    <div className="flex items-center justify-center h-full bg-gray-800 rounded">
                                        <a
                                            href={file.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-400 hover:text-blue-300 hover:underline"
                                        >
                                            View PDF
                                        </a>
                                    </div>
                                ) : (
                                    <Image
                                        src={file.url}
                                        alt={`Uploaded file ${index + 1}`}
                                        fill
                                        className="rounded object-cover"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}