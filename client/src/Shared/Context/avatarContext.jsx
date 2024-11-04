import React, { createContext } from 'react';

export const AvatarContext = createContext();

export function AvatarProvider({ children }) {
    const images = import.meta.glob('../src/assets/Images/avatars/*.{jpg,png,svg}', { eager: true });

    const avatars = Object.keys(images).map((path, index) => ({
        id: index + 1,
        src: images[path].default || images[path] 
    }));
    console.log("Avatars loaded:", avatars);

    return (
        <AvatarContext.Provider value={avatars}>
            {children}
        </AvatarContext.Provider>
    );
}
