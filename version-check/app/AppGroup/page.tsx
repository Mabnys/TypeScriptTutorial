'use client'

// Import necessary components and hooks
import Image from 'next/image';
import Header from '../Components/header';
import Footer from '../Components/footer';
import { useAppGroup } from './useAppGroup';
import Button from '../Components/button';
import { useSearchParams } from 'next/navigation'; // Import useSearchParams instead of useRouter
import { useState, useEffect } from 'react'; // Import useState and useEffect

export default function AppGroupPage() {
    // Use useSearchParams to get the query parameters
    const searchParams = useSearchParams();
    
    // State to store the groupId
    const [groupId, setGroupId] = useState<string | null>(null);

    // Effect to set the groupId when the component mounts or searchParams change
    useEffect(() => {
        // Get the groupId from the URL query parameters
        const groupIdParam = searchParams.get('groupId');
        setGroupId(groupIdParam);
    }, [searchParams]);

    // Use the custom hook to handle app group logic
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
        setImageUploadAppId,
        handleImageUpload,
    } = useAppGroup(groupId || ''); // Provide a fallback empty string if groupId is null

    // State for image upload modal
    const [imageModalOpen, setImageModalOpen] = useState(false);

    // Function to open image upload modal
    const openImageModal = (appId: string) => {
        setImageUploadAppId(appId);
        setImageModalOpen(true);
    };

    // Function to handle image file selection
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleImageUpload(file);
            setImageModalOpen(false);
        }
    };

    return (
        // Wrapper div to create a flex container for the entire page
        <div className="flex flex-col min-h-screen">
            <Header />
            {/* Main content area with flex-grow to push footer to bottom */}
            <main className="flex-grow pt-24 text-center mx-auto max-w-4xl">
                <h2 className="text-2xl font-bold mb-4">Apps in Selected Group</h2>
                
                {/* Action buttons */}
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

                {/* App table */}
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
                        {/* Map through apps and render each row */}
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
                                    {app.thumbnail ? (
                                        <Image 
                                            src={`data:image/png;base64,${app.thumbnail}`} 
                                            alt="App Thumbnail" 
                                            width={50} 
                                            height={50} 
                                            onClick={() => openImageModal(app.id)}
                                            className="cursor-pointer"
                                        />
                                    ) : (
                                        <Button onClick={() => openImageModal(app.id)}>Upload Image</Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Modal for adding/updating app */}
                {modalOpen && (
                    <div id="modalForm" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="modal-content bg-white p-6 rounded-lg w-full max-w-md">
                            {/* Close button */}
                            <span 
                                className="close text-gray-500 hover:text-gray-700 cursor-pointer float-right" 
                                onClick={() => setModalOpen(false)}
                            >
                                &times;
                            </span>
                            
                            {/* Modal title */}
                            <h2 id="modalTitle" className="text-xl font-bold mb-4">{modalTitle}</h2>

                            {/* Form for adding/updating apps */}
                            <form id="appForm" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                {/* App Name Input */}
                                <input 
                                    {...register("appName", { required: "App Name is required" })} 
                                    placeholder="App Name" 
                                    className={`w-full p-2 border rounded ${errors.appName ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.appName && <span className="text-red-500 text-sm">{errors.appName.message}</span>}

                                {/* Bundle ID Input */}
                                <input 
                                    {...register("bundleId", { required: "Bundle ID is required" })} 
                                    placeholder="Bundle ID" 
                                    className={`w-full p-2 border rounded ${errors.bundleId ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.bundleId && <span className="text-red-500 text-sm">{errors.bundleId.message}</span>}

                                {/* Minimum Target Version Input */}
                                <input 
                                    {...register("minTargetVersion", { required: "Minimum Target Version is required" })} 
                                    placeholder="Minimum Target Version" 
                                    className={`w-full p-2 border rounded ${errors.minTargetVersion ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.minTargetVersion && <span className="text-red-500 text-sm">{errors.minTargetVersion.message}</span>}

                                {/* Recommended Target Version Input */}
                                <input 
                                    {...register("recTargetVersion", { required: "Recommended Target Version is required" })} 
                                    placeholder="Recommended Target Version" 
                                    className={`w-full p-2 border rounded ${errors.recTargetVersion ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.recTargetVersion && <span className="text-red-500 text-sm">{errors.recTargetVersion.message}</span>}

                                {/* Platform Selection Dropdown */}
                                <select 
                                    {...register("platformName", { required: "Platform Name is required" })}
                                    className={`w-full p-2 border rounded ${errors.platformName ? 'border-red-500' : 'border-gray-300'}`}
                                >
                                    <option value="" disabled>Select Platform</option>
                                    <option value="iOS">iOS</option>
                                    <option value="Android">Android</option>
                                </select>
                                {errors.platformName && <span className="text-red-500 text-sm">{errors.platformName.message}</span>}

                                {/* Submit Button */}
                                <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors">
                                    Submit
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal for image upload */}
                {imageModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-lg">
                            <h3 className="text-xl font-bold mb-4">Upload/Change Image for App</h3>
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleFileChange} 
                                className="mb-4"
                            />
                            <Button onClick={() => setImageModalOpen(false)}>Cancel</Button>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
