'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth } from '@/app/firebase/firebase';
import { isEmailVerified, syncVerificationToFirestore } from '@/app/firebase/signupService';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const checkAndSyncVerification = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          setMessage('No user logged in. Please log in first.');
          setIsVerifying(false);
          setTimeout(() => router.push('/login'), 2000);
          return;
        }

        setUserEmail(user.email || '');

        // Reload to get the latest Firebase Auth state
        await user.reload();

        if (user.emailVerified) {
          // Email is verified in Firebase, sync to Firestore
          await syncVerificationToFirestore(user.uid);
          setMessage('Email verified successfully! Redirecting...');
          setIsVerifying(false);
          setTimeout(() => router.push('/dashboard'), 2000);
        } else {
          // Email not yet verified
          const reason = searchParams.get('reason');
          if (reason === 'unverified') {
            setMessage(
              `Your email (${user.email}) has not been verified yet. Please check your inbox and spam folder for the verification link and click it to verify your email.`
            );
          } else {
            setMessage(
              `Please verify your email at ${user.email}. Check your inbox and spam folder for the verification link.`
            );
          }
          setIsVerifying(false);
        }
      } catch (error) {
        console.error('[v0] Error checking verification:', error);
        setMessage('An error occurred while checking your verification status.');
        setIsVerifying(false);
      }
    };

    checkAndSyncVerification();
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Email Verification</h1>

        {isVerifying ? (
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600">Checking verification status...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div
              className={`p-4 rounded-lg ${
                message.includes('successfully')
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              <p className="font-semibold mb-2">
                {message.includes('successfully') ? '✓ Verified' : '⚠ Not Verified Yet'}
              </p>
              <p className="text-sm">{message}</p>
            </div>

            {!message.includes('successfully') && (
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Refresh & Check Again
              </button>
            )}

            <button
              onClick={() => router.push('/login')}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
            >
              Back to Login
            </button>
          </div>
        )}

        {userEmail && (
          <p className="text-xs text-gray-500 mt-6">Verification email sent to: {userEmail}</p>
        )}
      </div>
    </div>
  );
}
