import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to the login page
  redirect('/Login');

  // This return statement is not necessary, but included to satisfy TypeScript
  return null;
}