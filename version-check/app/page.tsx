'use client'

import Image from 'next/image';
import { useLogin } from './useLogin';

export default function Home() {
   // Use the custom hook to handle login logic
  const { register, handleSubmit, errors, loginError, onSubmit } = useLogin();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <Image src="/its.svg" alt="NYS ITS Logo" width={200} height={100} className="mx-auto mb-6" />
        
        {/* Login form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Username input */}
          <input
            {...register("username", { required: "Username is required" })}
            type="text"
            placeholder="Username"
            className="w-full px-3 py-2 border rounded-md"
          />
          {errors.username && <p className="text-red-500">{errors.username.message}</p>}
          
          {/* Password input */}
          <input
            {...register("password", { required: "Password is required" })}
            type="password"
            placeholder="Password"
            className="w-full px-3 py-2 border rounded-md"
          />
          {errors.password && <p className="text-red-500">{errors.password.message}</p>}

          {/* Submit button */}
          <button type="submit" className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600">
            Login
          </button>
          
          {/* Display login error if any */}
          {loginError && <p className="text-red-500">{loginError}</p>}
        </form>
      </div>
    </div>
  );
}
