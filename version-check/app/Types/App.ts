// This interface defines the structure of an App object
export interface App {
    // Unique identifier for the app
    id: string;

    // Name of the app
    appName: string;

    // Bundle identifier of the app (e.g., com.example.app)
    bundleId: string;

    // Minimum supported version of the app
    minimumTargetVersion: string;

    // Recommended version of the app
    recommendedTargetVersion: string;

    // Platform the app is designed for (e.g., iOS, Android)
    platformName: string;

    // Date of the last update (ISO 8601 format)
    lastUpdateDate: string;

    // Optional array of image objects associated with the app
    images?: AppImage[];
}

// Interface for app images (e.g., icons, screenshots)
export interface AppImage {
    // Unique identifier for the image
    id: string;

    // URL or base64 encoded string of the image
    blob: string;

    // Type of the image (e.g., 'icon', 'screenshot')
    type: string;
}
