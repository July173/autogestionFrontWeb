import { useLocation } from "react-router-dom";
import { useEffect } from "react";

/**
 * Component to display a 404 error page when the user accesses a non-existent route.
 *
 * - Shows an error message and a link to return to home.
 * - Logs the attempt to access a non-existent route to the console.
 *
 * @component
 * @returns {JSX.Element} 404 error page.
 */
export const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // Logs the attempt to access a non-existent route to the console
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          Return to Home
        </a>
      </div>
    </div>
  );
};

