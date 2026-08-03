import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import Link from 'next/link';

export default function SubscriptionPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        // Fetch current subscription
        const subResponse = await axios.get(`/api/payments/subscription`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setSubscription(subResponse.data.data || null);

        // Fetch payment history
        const paymentsResponse = await axios.get(`/api/payments/history`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setPaymentHistory(paymentsResponse.data.data || []);
      } catch (err: any) {
        console.error('Error fetching subscription data:', err);
        setError(
          err.response?.data?.message ||
            err.message ||
            'Failed to load subscription information'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionData();
  }, [user]);

  const handleUpgrade = async (plan: string) => {
    if (!user) return;
    try {
      setLoading(true);
      // In a real app, this would redirect to Stripe checkout or create a payment intent
      await axios.post(
        `/api/payments/checkout`,
        { plan },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      // For now, we'll just refetch after a short delay to simulate update
      setTimeout(() => {
        fetchSubscriptionData();
      }, 1500);
      alert(`Upgrading to ${plan} plan... Redirecting to payment...`);
    } catch (err: any) {
      console.error('Error upgrading subscription:', err);
      alert(
        err.response?.data?.message ||
          'Failed to process upgrade. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDowngrade = async (plan: string) => {
    if (!user) return;
    if (!window.confirm(`Are you sure you want to downgrade to ${plan} plan? This will take effect at the end of your current billing cycle.`)) return;
    try {
      setLoading(true);
      await axios.post(
        `/api/payments/downgrade`,
        { plan },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      alert(`Downgrade to ${plan} plan scheduled. Will take effect at the end of your current billing cycle.`);
      setTimeout(() => {
        fetchSubscriptionData();
      }, 1500);
    } catch (err: any) {
      console.error('Error downgrading subscription:', err);
      alert(
        err.response?.data?.message ||
          'Failed to process downgrade. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!user) return;
    if (!window.confirm('Are you sure you want to cancel your subscription?')) return;
    try {
      setLoading(true);
      await axios.post(
        `/api/payments/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      alert('Subscription cancelled successfully');
      setTimeout(() => {
        fetchSubscriptionData();
      }, 1500);
    } catch (err: any) {
      console.error('Error cancelling subscription:', err);
      alert(
        err.response?.data?.message ||
          'Failed to cancel subscription. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Subscription</h2>
              <div className="space-y-4">
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex items-between justify-between text-sm">
                      <span>Current Plan</span>
                      <span className="flex items-center space-x-2">
                        <div className="h-3 w-3 rounded-full bg-indigo-500"></div>
                        <span>Loading...</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{error}</p>
          </div>
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Subscription</h2>
            {/* Form will be rendered below */}
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Default subscription data if none returned (for demo)
  const currentPlan = subscription?.plan || 'free';
  const planName =
    currentPlan === 'free'
      ? 'Free'
      : currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1).toLowerCase();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
            <svg className="h-5 w-5 text-indigo-600" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4l3 3"/>
            </svg>
            Subscription
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Manage your StudySpace membership and billing
          </p>
        </div>

        {/* Current Plan Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center">
                {/* Plan icon based on tier */}
                {currentPlan === 'free' ? '🆓' : currentPlan === 'basic' ? '🥈' : currentPlan === 'pro' ? '🥇' : '💎'}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Current Plan: {planName}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {subscription?.status === 'active' ? 'Active subscription' : 'On trial or inactive'}
                {subscription?.currentPeriodEnd ? (
                  <span className="ml-2 text-xs text-gray-400">
                    • Renews on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </span>
                ) : ''}
              </p>
            </div>
          </div>
          {subscription?.currentPeriodEnd && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Next billing: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            </div>
          )}
          <div className="mt-4 flex items-center space-x-3">
            {currentPlan !== 'premium' && (
              <button
                onClick={() => handleUpgrade('premium')}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
              >
                Upgrade to Premium
              </button>
            )}
            {currentPlan !== 'pro' && currentPlan !== 'premium' && (
              <button
                onClick={() => handleUpgrade('pro')}
                className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
              >
                Upgrade to Pro
              </button>
            )}
            {currentPlan !== 'basic' && currentPlan !== 'free' && (
              <button
                onClick={() => handleDowngrade('basic')}
                className="flex-1 px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700"
              >
                Downgrade to Basic
              </button>
            )}
            {currentPlan !== 'free' && (
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700"
              >
                Cancel Subscription
              </button>
            )}
          </div>
        </div>

        {/* Plan Comparison */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Available Plans</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Free Plan */}
            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-2">
                <div className="h-8 w-8 flex items-center justify-center bg-gray-200 text-gray-500 rounded-full">
                  🆓
                </div>
                <h4 className="ml-3 font-medium text-gray-900">Free</h4>
              </div>
              <p className="text-sm text-gray-500 mb-2">$0/month</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Access to public study rooms</li>
                <li>• Basic note-taking features</li>
                <li>• Limited AI queries (5/day)</li>
                <li>• Community support</li>
              </ul>
              {currentPlan === 'free' && (
                <div className="mt-3 flex justify-center">
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Current Plan
                  </span>
                </div>
              )}
            </div>

            {/* Basic Plan */}
            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow border-l-4 border-blue-500">
              <div className="flex items-center mb-2">
                <div className="h-8 w-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full">
                  🥈
                </div>
                <h4 className="ml-3 font-medium text-gray-900">Basic</h4>
              </div>
              <p className="text-sm text-gray-500 mb-2">$4.99/month</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• All Free features</li>
                <li>• Private study rooms (up to 10 members)</li>
                <li>• Unlimited AI queries</li>
                <li>• Advanced note-taking & organization</li>
                <li>• Priority email support</li>
              </ul>
              {currentPlan === 'basic' && (
                <div className="mt-3 flex justify-center">
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Current Plan
                  </span>
                </div>
              )}
            </div>

            {/* Pro Plan */}
            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow border-l-4 border-purple-500">
              <div className="flex items-center mb-2">
                <div className="h-8 w-8 flex items-center justify-center bg-purple-100 text-purple-600 rounded-full">
                  🥇
                </div>
                <h4 className="ml-3 font-medium text-gray-900">Pro</h4>
              </div>
              <p className="text-sm text-gray-500 mb-2">$9.99/month</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• All Basic features</li>
                <li>• Unlimited private study rooms</li>
                <li>• AI doubt solver & quiz generator</li>
                <li>• Notes summarizer & learning path recommendations</li>
                <li>• Advanced analytics & insights</li>
                <li>• Priority live chat support</li>
              </ul>
              {currentPlan === 'pro' && (
                <div className="mt-3 flex justify-center">
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Current Plan
                  </span>
                </div>
              )}
            </div>

            {/* Premium Plan */}
            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow border-l-4 border-emerald-500">
              <div className="flex items-center mb-2">
                <div className="h-8 w-8 flex items-center justify-center bg-emerald-100 text-emerald-600 rounded-full">
                  💎
                </div>
                <h4 className="ml-3 font-medium text-gray-900">Premium</h4>
              </div>
              <p className="text-sm text-gray-500 mb-2">$99.99/year ($8.33/month)</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• All Pro features</li>
                <li>• Dedicated account manager</li>
                <li>• Custom branding for study rooms</li>
                <li>• Advanced admin controls</li>
                <li>• API access for integrations</li>
                <li>• 24/7 priority phone support</li>
              </ul>
              {currentPlan === 'premium' && (
                <div className="mt-3 flex justify-center">
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Current Plan
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Payment History</h3>
          {paymentHistory.length === 0 ? (
            <p className="text-center py-8 text-gray-500">
              No payment history yet
            </p>
          ) : (
            <div className="space-y-4">
              {paymentHistory.map((payment) => (
                <div key={payment.id} className="p-4 bg-white rounded-lg shadow-sm border-l-4 border-indigo-500">
                  <div className="flex items-between justify-between mb-2">
                    <span className="font-medium text-gray-900">
                      Payment #{payment.id.slice(0, 8)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(payment.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-between justify-between text-sm">
                    <span>{payment.description}</span>
                    <span className="font-medium text-indigo-600">₹{payment.amount}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}