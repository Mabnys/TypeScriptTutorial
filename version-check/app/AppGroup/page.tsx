'use client'

import Image from 'next/image';
import Header from '../Components/header';
import Footer from '../Components/footer';
import { useAppGroup } from './useAppGroup';
import Button from '../Components/button';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import ImageUploadModal from '../Components/imageUploadModal';

export default function AppGroupPage() {
    const searchParams = useSearchParams();
    const [groupId, setGroupId] = useState<string | null>(null);

    useEffect(() => {
        const groupIdParam = searchParams.get('groupId');
        setGroupId(groupIdParam);
    }, [searchParams]);

    const {
        apps,
        selectedAppId,
        setSelectedAppId,
        modalOpen,
        setModalOpen,
        modalTitle,
        register,
        handleSubmit,
        errors,
        handleOpenModal,
        onSubmit,
        handleDelete,
        fetchApps,
        handleImageUpload: handleAppImageUpload,
    } = useAppGroup(groupId || '');

    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [selectedAppIdForImage, setSelectedAppIdForImage] = useState<string | null>(null);

    const openImageUploadModal = (appId: string) => {
        setSelectedAppIdForImage(appId);
        setIsImageModalOpen(true);
    };

    const handleImageUpload = (file: File) => {
        if (selectedAppIdForImage) {
            handleAppImageUpload(file);
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow pt-24 text-center mx-auto max-w-4xl">
                <h2 className="text-2xl font-bold mb-4">Apps in Selected Group</h2>
                
                <div className="flex space-x-2 mb-4">
                    <Button onClick={fetchApps}>Refresh App List</Button>
                    <Button onClick={() => handleOpenModal('Add')}>Add App</Button>
                    <Button 
                        onClick={() => handleOpenModal('Update App', apps.find(app => app.id === selectedAppId))} 
                        disabled={!selectedAppId} 
                        variant='secondary'
                    >
                        Update App
                    </Button>
                    <Button onClick={handleDelete} disabled={!selectedAppId} variant='danger'>Delete App</Button>
                </div>

                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-gray-300 p-2">Select</th>
                            <th className="border border-gray-300 p-2">ID</th>
                            <th className="border border-gray-300 p-2">App Name</th>
                            <th className="border border-gray-300 p-2">Bundle ID</th>
                            <th className="border border-gray-300 p-2">Minimum Target Version</th>
                            <th className="border border-gray-300 p-2">Recommended Target Version</th>
                            <th className="border border-gray-300 p-2">Platform Name</th>
                            <th className="border border-gray-300 p-2">Last Update Date</th>
                            <th className="border border-gray-300 p-2">Thumbnail</th>
                        </tr>
                    </thead>
                    <tbody>
                        {apps.map(app => (
                            <tr key={app.id}>
                                <td>
                                    <input
                                        type="radio"
                                        name="appSelect"
                                        value={app.id}
                                        onChange={() => setSelectedAppId(app.id)}
                                        checked={selectedAppId === app.id}
                                    />
                                </td>
                                <td>{app.id}</td>
                                <td>{app.appName}</td>
                                <td>{app.bundleId}</td>
                                <td>{app.minimumTargetVersion}</td>
                                <td>{app.recommendedTargetVersion}</td>
                                <td>{app.platformName}</td>
                                <td>{new Date(app.lastUpdateDate).toLocaleDateString()}</td>
                        <td>
                            {app.images ? (
                                <Image 
                                    src={`data:image/png;base64,${app.images[0].blob}`}
                                    alt={`Thumbnail for ${app.appName}`}
                                    width={50} 
                                    height={50} 
                                    onClick={() => openImageUploadModal(app.id)}
                                    className="cursor-pointer"
                                />
                            ) : (
                                <Button onClick={() => openImageUploadModal(app.id)} variant='upload'>
                                    Upload Thumbnail
                                </Button>
                            )}
                        </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                {modalOpen && (
                    <div id="modalForm" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="modal-content bg-white p-6 rounded-lg w-full max-w-md">
                            <span 
                                className="close text-gray-500 hover:text-gray-700 cursor-pointer float-right" 
                                onClick={() => setModalOpen(false)}
                            >
                                &times;
                            </span>
                            
                            <h2 id="modalTitle" className="text-xl font-bold mb-4">{modalTitle}</h2>

                            <form id="appForm" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <input 
                                    {...register("appName", { required: "App Name is required" })} 
                                    placeholder="App Name" 
                                    className={`w-full p-2 border rounded ${errors.appName ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.appName && <span className="text-red-500 text-sm">{errors.appName.message}</span>}

                                <input 
                                    {...register("bundleId", { required: "Bundle ID is required" })} 
                                    placeholder="Bundle ID" 
                                    className={`w-full p-2 border rounded ${errors.bundleId ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.bundleId && <span className="text-red-500 text-sm">{errors.bundleId.message}</span>}

                                <input 
                                    {...register("minTargetVersion", { required: "Minimum Target Version is required" })} 
                                    placeholder="Minimum Target Version" 
                                    className={`w-full p-2 border rounded ${errors.minTargetVersion ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.minTargetVersion && <span className="text-red-500 text-sm">{errors.minTargetVersion.message}</span>}

                                <input 
                                    {...register("recTargetVersion", { required: "Recommended Target Version is required" })} 
                                    placeholder="Recommended Target Version" 
                                    className={`w-full p-2 border rounded ${errors.recTargetVersion ? 'border-red-300' : 'border-gray-300'}`}
                                />
                                {errors.recTargetVersion && <span className="text-red-500 text-sm">{errors.recTargetVersion.message}</span>}
                                {/* Platform Selection Dropdown */}
                                {/* Wrapper div for centering the dropdown */}
                                <div className="flex justify-center">
                                    <select 
                                        {...register("platformName", { required: "Platform selection is required" })}
                                        className={`w-1/2 p-2 border rounded ${errors.platformName ? 'border-red-500' : 'border-gray-300'}`}
                                    >
                                        <option value="Select Platform">Select Platform</option>
                                        <option value="iOS">iOS</option>
                                        <option value="Android">Android</option>
                                    </select>
                                </div>
                                {errors.platformName && <span className="text-red-500 text-sm">{errors.platformName.message}</span>}

                                <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors">
                                    Submit
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                <ImageUploadModal
                    isOpen={isImageModalOpen}
                    onClose={() => setIsImageModalOpen(false)}
                    onUpload={handleImageUpload}
                    headerText="Upload/Change Thumbnail for App"
                />
            </main>
            <Footer />
        </div>
    );
}
