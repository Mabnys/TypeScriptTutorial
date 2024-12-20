import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="
    bg-gray-800 // Dark background color (similar to #333)
    text-white // White text color
    py-4 // Vertical padding (15px equivalent)
    text-center // Center-align text
    border-t border-gray-700 // Top border (1px solid, slightly lighter than background)
    mt-8 // Top margin (30px equivalent)
  ">
      <p>© 2024 - New York State Department of Technology</p>
    </footer>
  );
};

export default Footer;