'use client'

import React, { useState } from 'react';
// import Image from 'next/image';
import { useAppGroup } from './useAppGroup';
import Header from '../../Components/header';
import Footer from '../../Components/footer';
import Button from '../../Components/button';
import AppList from '../../Components/AppGroup/AppList';
import ImageUploadModal from '../../Components/imageUploadModal';

export default function AppGroupPage({ params }: { params: Promise<{ groupId: string }> }) {
    const { groupId } = React.use(params);
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
        handleImageUpload,
        loading,
        error
    } = useAppGroup(groupId);

    const [isImageModalOpen, setIsImageModalOpen] = useState(false);

    const openImageUploadModal = () => {
        setIsImageModalOpen(true);
    };

    const handleImageUploadWrapper = (file: File) => {
        handleImageUpload(file);
        setIsImageModalOpen(false);
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow pt-24 text-center mx-auto max-w-4xl">
                <h2 className="text-2xl font-bold mb-4">Apps in Selected Group</h2>
                
                <div className="flex space-x-2 mb-4">
                    <Button onClick={fetchApps}>Refresh App List</Button>
                    <Button onClick={() => handleOpenModal('Add App')}>Add App</Button>
                    <Button 
                        onClick={() => handleOpenModal('Update App', apps.find(app => app.id === selectedAppId))} 
                        disabled={!selectedAppId} 
                        variant='secondary'
                    >
                        Update App
                    </Button>
                    <Button onClick={handleDelete} disabled={!selectedAppId} variant='danger'>Delete App</Button>
                </div>

                <AppList 
                    apps={apps} 
                    selectedAppId={selectedAppId}
                    onSelectApp={setSelectedAppId}
                    onImageUpload={openImageUploadModal}
                />

                {modalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-lg w-full max-w-md">
                            <h2 className="text-xl font-bold mb-4">{modalTitle}</h2>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <input {...register("appName", { required: "App Name is required" })} placeholder="App Name" className="w-full p-2 border rounded" />
                                {errors.appName && <span className="text-red-500">{errors.appName.message}</span>}
                                
                                <input {...register("bundleId", { required: "Bundle ID is required" })} placeholder="Bundle ID" className="w-full p-2 border rounded" />
                                {errors.bundleId && <span className="text-red-500">{errors.bundleId.message}</span>}
                                
                                <input {...register("minimumTargetVersion", { required: "Minimum Target Version is required" })} placeholder="Minimum Target Version" className="w-full p-2 border rounded" />
                                {errors.minimumTargetVersion && <span className="text-red-500">{errors.minimumTargetVersion.message}</span>}
                                
                                <input {...register("recommendedTargetVersion", { required: "Recommended Target Version is required" })} placeholder="Recommended Target Version" className="w-full p-2 border rounded" />
                                {errors.recommendedTargetVersion && <span className="text-red-500">{errors.recommendedTargetVersion.message}</span>}
                                
                                <select {...register("platformName", { required: "Platform is required" })} className="w-full p-2 border rounded">
                                    <option value="">Select Platform</option>
                                    <option value="iOS">iOS</option>
                                    <option value="Android">Android</option>
                                </select>
                                {errors.platformName && <span className="text-red-500">{errors.platformName.message}</span>}
                                
                                <Button type="submit">Submit</Button>
                            </form>
                            <Button onClick={() => setModalOpen(false)} variant="secondary" className="mt-4">Close</Button>
                        </div>
                    </div>
                )}

                <ImageUploadModal
                    isOpen={isImageModalOpen}
                    onClose={() => setIsImageModalOpen(false)}
                    onUpload={handleImageUploadWrapper}
                    headerText="Upload/Change Thumbnail for App"
                />
            </main>
            <Footer />
        </div>
    );
}
