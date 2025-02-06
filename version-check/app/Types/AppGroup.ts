// types/AppGroup.ts

// This interface defines the structure of an AppGroup object
export interface AppGroup {
    // Unique identifier for the app group
    id: string;
  
    // Name of the app group
    groupName: string;
  
    // Description of the app group
    appDescription: string;
  
    // Optional image object for the group (e.g., a thumbnail)
    image?: AppGroupImage;
  
    // Optional array of App IDs that belong to this group
    appIds?: string[];
}

// Interface for app group images (e.g., thumbnails)
export interface AppGroupImage {
    // Unique identifier for the image
    id: string;

    // URL or base64 encoded string of the image
    blob: string;
}
  