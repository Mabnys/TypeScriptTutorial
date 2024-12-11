'use client'

import Image from 'next/image';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import from next/navigation for app directory

type Inputs = {
  username: string
  password: string
}

export default function Home() {
  const { register, handleSubmit, formState: { errors } } = useForm<Inputs>()
  const [loginError, setLoginError] = useState<string>('')
  const router = useRouter(); // Initialize the router

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      const response = await fetch('http://localhost:8080/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: data.username,
          password: data.password,
          grant_type: 'password'
        }),
      })

      if (response.ok) {
        const responseData = await response.json()
        console.log('Login successful:', responseData)

        // Set cookies with authentication information
        document.cookie = `authToken=${responseData.access_token}; path=/; max-age=3600; SameSite=Lax;`
        document.cookie = `userEmail=${data.username}; path=/; max-age=3600; SameSite=Lax;`

        // Redirect to the appGroupPage after successful login
        router.push('/AppGroup');
      } else {
        setLoginError('Invalid username or password.')
      }
    } catch (error) {
      console.error('Login error:', error)
      setLoginError('An error occurred during login.')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <Image src="/its.png" alt="NYS ITS Logo" width={200} height={100} className="mx-auto mb-6" />
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            {...register("username", { required: "Username is required" })}
            type="text"
            placeholder="Username"
            className="w-full px-3 py-2 border rounded-md"
          />
          {errors.username && <p className="text-red-500">{errors.username.message}</p>}
          
          <input
            {...register("password", { required: "Password is required" })}
            type="password"
            placeholder="Password"
            className="w-full px-3 py-2 border rounded-md"
          />
          {errors.password && <p className="text-red-500">{errors.password.message}</p>}
          
          <button type="submit" className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600">
            Login
          </button>
          
          {loginError && <p className="text-red-500">{loginError}</p>}
        </form>
      </div>
    </div>
  )
}
