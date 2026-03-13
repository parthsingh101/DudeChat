import { redirect } from 'next/navigation';

export default function Home() {
  // The middleware will handle redirects based on auth state,
  // but if it reaches here, we default to login
  redirect('/login');
}
