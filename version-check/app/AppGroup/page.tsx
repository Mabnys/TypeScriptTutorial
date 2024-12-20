'use client'

import Image from 'next/image';
import Header from '../Header/header';
import Footer from '../Footer/footer';
import { useAppGroup } from './useAppGroup';


export default function AppGroupPage() {
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
        fetchApps
    } = useAppGroup();

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
                <div className="content container mx-auto px-4 py-8">
                    <h2 className="text-2xl font-bold mb-4">Apps in Selected Group </h2>
                    
                    {/* Action buttons */}
                    <div className="action-buttons">
                        <button onClick={fetchApps} className="action-button">Refresh App List</button>
                        <button onClick={() => handleOpenModal('Add App')} className="action-button">Add App</button>
                        <button onClick={() => handleOpenModal('Update App', apps.find(app => app.id === selectedAppId))} className="action-button" disabled={!selectedAppId}>Update App</button>
                        <button onClick={handleDelete} className="action-button" disabled={!selectedAppId}>Delete App</button>
                    </div>

                    {/* App table */}
                    <table id="appTable" border={1} cellPadding={10} cellSpacing={0}>
                        <thead>
                            <tr>
                                <th>Select</th>
                                <th>ID</th>
                                <th>App Name</th>
                                <th>Bundle ID</th>
                                <th>Minimum Target Version</th>
                                <th>Recommended Target Version</th>
                                <th>Platform Name</th>
                                <th>Last Update Date</th>
                                <th>Thumbnail</th>
                                <th>App Group ID</th>
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
                                    <td>{app.thumbnail && <Image src={app.thumbnail} alt="App Thumbnail" width={50} height={50} />}</td>
                                    <td>{app.appGroup?.id || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Modal for adding/updating apps */}
                    {modalOpen && (
                        <div className="modal">
                            <div className="modal-content">
                                <span className="close" onClick={() => setModalOpen(false)}>&times;</span>
                                <h2>{modalTitle}</h2>
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    {/* Form inputs */}
                                    <input {...register('appName', { required: 'App Name is required' })} placeholder="App Name" />
                                    {errors.appName && <span>{errors.appName.message}</span>}
                                    
                                    <input {...register('bundleId', { required: 'Bundle ID is required' })} placeholder="Bundle ID" />
                                    {errors.bundleId && <span>{errors.bundleId.message}</span>}
                                    
                                    <input {...register('minTargetVersion', { required: 'Minimum Target Version is required' })} placeholder="Minimum Target Version" />
                                    {errors.minTargetVersion && <span>{errors.minTargetVersion.message}</span>}
                                    
                                    <input {...register('recTargetVersion', { required: 'Recommended Target Version is required' })} placeholder="Recommended Target Version" />
                                    {errors.recTargetVersion && <span>{errors.recTargetVersion.message}</span>}
                                    
                                    <select {...register('platformName', { required: 'Platform Name is required' })}>
                                        <option value="" disabled>Select Platform</option>
                                        <option value="iOS">iOS</option>
                                        <option value="Android">Android</option>
                                    </select>
                                    {errors.platformName && <span>{errors.platformName.message}</span>}
                                    
                                    <input {...register('appGroupId', { required: 'App Group ID is required' })} placeholder="App Group ID" />
                                    {errors.appGroupId && <span>{errors.appGroupId.message}</span>}
                                    
                                    <button type="submit">Submit</button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
