import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation';

// Define the structure of login form inputs
type LoginInputs = {
  username: string;
  password: string;
};

export const useLogin = () => {
// State to hold login error messages
  const [loginError, setLoginError] = useState<string>('');
  const router = useRouter();

  // Initialize react-hook-form
  const { register, handleSubmit, formState: { errors } } = useForm<LoginInputs>();

  // Handle form submission
  const onSubmit: SubmitHandler<LoginInputs> = async (data) => {
    try {
    // Send login request to the server
      const response = await fetch('http://localhost:8080/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: data.username,
          password: data.password,
          grant_type: 'password'
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('Login successful:', responseData);

        // Set authentication cookies
        document.cookie = `authToken=${responseData.access_token}; path=/; max-age=3600; SameSite=Lax;`;
        document.cookie = `userEmail=${data.username}; path=/; max-age=3600; SameSite=Lax;`;
        // Redirect to app group page on successful login
        router.push('/appGroupPage');
      } else {
        setLoginError('Invalid username or password.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('An error occurred during login.');
    }
  };

  // Return necessary functions and state for the login form
  return { register, handleSubmit, errors, loginError, onSubmit };
};
