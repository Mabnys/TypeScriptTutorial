'use client'  // Indicates that this code should run on the client side

export function setupLogin() {
  // Get references to the login form and error message elements
  const loginForm = document.getElementById('login-form') as HTMLFormElement;
  const loginError = document.getElementById('login-error') as HTMLParagraphElement;

  // Add a submit event listener to the login form
  loginForm.addEventListener('submit', async (e: Event) => {
    e.preventDefault();  // Prevent the default form submission behavior

    // Get the values from the username and password input fields
    const username = (document.getElementById('username') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;

    try {
      // Send a POST request to the OAuth token endpoint
      const response = await fetch('/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          username, 
          password, 
          grant_type: 'password'  // Specify the grant type for OAuth
        }),
      });

      if (response.ok) {
        // If the response is successful, parse the JSON data
        const data = await response.json();
        console.log('Login successful:', data);

        // Set cookies with the authentication token and user email
        // Note: In a production environment, consider using more secure methods for storing tokens
        document.cookie = `authToken=${data.access_token}; path=/; max-age=3600; SameSite=Lax;`;
        document.cookie = `userEmail=${username}; path=/; max-age=3600; SameSite=Lax;`;

        // Redirect to the home page after successful login
        window.location.href = '/';
      } else {
        // If the response is not ok, display an error message
        loginError.textContent = 'Invalid username or password.';
      }
    } catch (error) {
      // If there's an error during the fetch operation, log it and display a generic error message
      console.error('Login error:', error);
      loginError.textContent = 'An error occurred during login.';
    }
  });
}