import Image from 'next/image'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <Image src="/its.png" alt="NYS ITS Logo" width={200} height={100} className="mx-auto mb-6" />
        
        <form className="space-y-4" id="login-form">
          <input type="text" id="username" placeholder="Username" required className="w-full px-3 py-2 border rounded-md" />
          <input type="password" id="password" placeholder="Password" required className="w-full px-3 py-2 border rounded-md" />
          <button type="submit" className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600">Login</button>
          <p id="login-error" className="text-red-500"></p>
        </form>
      </div>
    </div>
  )
}
