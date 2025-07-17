import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  Modal 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomSafeAreaView from '../components/CustomSafeAreaView';
import { paymentService } from '../services/paymentService';
import { useMixpanel } from '@macro-meals/mixpanel';

interface SubscriptionDetails {
  amount: number;
  billing_interval: string;
  cancel_at_period_end: boolean;
  created: string;
  currency: string;
  current_period_end: string;
  current_period_start: string;
  has_subscription: boolean;
  next_billing_date: string;
  plan: string;
  plan_name: string;
  status: string;
  subscription_id: string;
  trial_end: string;
}

const ManageSubscriptionsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [reactivating, setReactivating] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const mixpanel = useMixpanel();

  useEffect(() => {
    fetchSubscriptionDetails();
  }, []);

  const fetchSubscriptionDetails = async () => {
    try {
      setLoading(true);
      const data = await paymentService.getSubscriptionDetails();
      setSubscription(data);
    } catch (error: any) {
      console.error('Failed to fetch subscription details:', error);
      const errorMessage = error.message || 'Failed to load subscription details';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount); // Amount is already in the correct units
  };

  const getPlanDisplayName = (plan: string, planName: string) => {
    if (planName) return planName;
    
    const planMap: { [key: string]: string } = {
      'monthly': 'Premium Monthly',
      'yearly': 'Premium Yearly',
      'premium_monthly': 'Premium Monthly',
      'premium_yearly': 'Premium Yearly'
    };
    
    return planMap[plan] || plan;
  };

  const getStatusDisplay = (status: string, cancelAtPeriodEnd: boolean) => {
    if (cancelAtPeriodEnd) {
      return `Premium – Cancelled (ends ${formatDate(subscription?.current_period_end || '')})`;
    }
    
    const statusMap: { [key: string]: string } = {
      'active': 'Active',
      'canceled': 'Cancelled',
      'past_due': 'Past Due',
      'unpaid': 'Unpaid',
      'trialing': 'Trial'
    };
    
    return statusMap[status] || status;
  };

  const handleCancelSubscription = () => {
    setShowCancelModal(true);
  };

  const handleReactivateSubscription = async () => {
    try {
      setReactivating(true);

      // Track reactivation in Mixpanel
      mixpanel?.track({
        name: 'subscription_reactivated',
        properties: {
          plan: subscription?.plan || 'unknown',
          plan_name: subscription?.plan_name || 'unknown',
          billing_interval: subscription?.billing_interval || 'unknown',
          amount: subscription?.amount || 0,
          currency: subscription?.currency || 'unknown'
        }
      });

      // Call reactivation without subscription_id since the backend doesn't provide it for cancelled subscriptions
      await paymentService.reactivateSubscription();

      // Refresh subscription details
      await fetchSubscriptionDetails();

      // Show success message as a toast-style notification
      Alert.alert(
        'Success',
        'Subscription reactivated. Your plan remains active.',
        [{ text: 'OK' }],
        { cancelable: true }
      );
    } catch (error) {
      console.error('Failed to reactivate subscription:', error);
      Alert.alert('Error', 'Failed to reactivate subscription. Please try again.');
    } finally {
      setReactivating(false);
    }
  };

  const confirmCancelSubscription = async () => {
    if (!subscription) return;

    try {
      setCancelling(true);
      setShowCancelModal(false);

      // Track cancellation in Mixpanel
      mixpanel?.track({
        name: 'subscription_cancelled',
        properties: {
          plan: subscription.plan,
          plan_name: subscription.plan_name,
          billing_interval: subscription.billing_interval,
          amount: subscription.amount,
          currency: subscription.currency
        }
      });

      await paymentService.cancelSubscription(
        subscription.subscription_id,
        subscription.status
      );

      // Refresh subscription details
      await fetchSubscriptionDetails();

      Alert.alert(
        'Subscription Cancelled',
        `Your subscription has been cancelled. You'll continue to have access until ${formatDate(subscription.current_period_end)}.`
      );
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      Alert.alert('Error', 'Failed to cancel subscription. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

//   if (loading) {
//     return (
//       <View className="flex-1 justify-center items-center bg-white">
//         <ActivityIndicator size="large" color="#19a28f" />
//       </View>
//     );
//   }

  return (
    <CustomSafeAreaView className="flex-1 bg-white" edges={["left", "right"]}>
      <ScrollView contentContainerStyle={{ backgroundColor: "#f8f8f8", flexGrow: 1 }}>
        {/* Header - Always visible */}
        <View className="flex-row bg-white items-center justify-between px-5 pt-4 pb-5 mb-5">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-8 h-8 rounded-full justify-center items-center bg-[#F5F5F5]"
          >
            <Text className="text-[22px]">‹</Text>
          </TouchableOpacity>
          <Text className="text-[20px] font-semibold text-[#222] text-center">
            Manage Subscription
          </Text>
          <View className="w-8" />
        </View>

        {
            loading ? (
                <View className="flex-1 justify-center items-center bg-white">
                    <ActivityIndicator size="large" color="#19a28f" />
                </View>
            ) : 
            (
                <>
                  {!subscription ? (
          // No subscription data at all
          <View className="bg-white rounded-2xl mx-3 px-6 py-8 shadow-sm">
            <Text className="text-lg font-semibold text-[#222] text-center mb-2">
              No Active Subscription
            </Text>
            <Text className="text-base text-[#888] text-center">
              You don't have an active subscription. Subscribe to unlock premium features.
            </Text>
          </View>
        ) : (
          // Has subscription state
          <>
            {/* Subscription Details Card */}
            <View className="bg-white rounded-2xl mx-3 px-0 py-0 shadow-sm">
              {/* Plan */}
              <View className="flex-row items-center min-h-[56px] border-b border-[#f0f0f0] px-4">
                <Text className="flex-1 text-base text-[#222]">Plan</Text>
                <Text className="text-base text-[#222] font-medium">
                  {subscription?.plan && subscription?.plan_name 
                    ? getPlanDisplayName(subscription.plan, subscription.plan_name)
                    : 'Subscription'
                  }
                </Text>
              </View>

              {/* Status */}
              <View className="flex-row items-center min-h-[56px] border-b border-[#f0f0f0] px-4">
                <Text className="flex-1 text-base text-[#222]">Status</Text>
                <View className="flex-row items-center">
                  <View className="w-2 h-2 rounded-full mr-2 bg-orange-500" />
                  <Text className="text-base font-medium text-orange-600">
                    Premium – Cancelled
                  </Text>
                </View>
              </View>

              {/* Amount */}
              {subscription?.amount && subscription?.currency && (
                <View className="flex-row items-center min-h-[56px] border-b border-[#f0f0f0] px-4">
                  <Text className="flex-1 text-base text-[#222]">Amount</Text>
                  <Text className="text-base text-[#222] font-medium">
                    {formatCurrency(subscription.amount, subscription.currency)}
                    {subscription.billing_interval && (
                      <Text className="text-[#888] font-normal">
                        /{subscription.billing_interval}
                      </Text>
                    )}
                  </Text>
                </View>
              )}

              {/* Next Billing Date */}
              {subscription?.next_billing_date && (
                <View className="flex-row items-center min-h-[56px] border-b border-[#f0f0f0] px-4">
                  <Text className="flex-1 text-base text-[#222]">Next billing date</Text>
                  <Text className="text-base text-[#222]">
                    {formatDate(subscription.next_billing_date)}
                  </Text>
                </View>
              )}

              {/* Current Period */}
              {subscription?.current_period_start && subscription?.current_period_end && (
                <View className="flex-row items-center min-h-[56px] px-4">
                  <Text className="flex-1 text-base text-[#222]">Current period</Text>
                  <Text className="text-base text-[#222] text-right">
                    {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
                  </Text>
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View className="mt-8 mx-4">
              {!subscription?.has_subscription ? (
                // Reactivate button for cancelled subscriptions (when has_subscription is false)
                <TouchableOpacity
                  className="pl-4 flex-row justify-start bg-white rounded-xl py-6"
                  onPress={handleReactivateSubscription}
                  disabled={reactivating}
                >
                  {reactivating ? (
                    <ActivityIndicator size="small" color="#19a28f" style={{ marginRight: 12 }} />
                  ) : (
                    <Text className="text-[#19a28f] text-left font-semibold text-base">
                      Reactivate Subscription
                    </Text>
                  )}
                </TouchableOpacity>
              ) : subscription?.has_subscription ? (
                // Cancel button for active subscriptions
                <TouchableOpacity
                  className="pl-4 flex-row justify-start bg-white rounded-xl py-6"
                  onPress={handleCancelSubscription}
                  disabled={cancelling}
                >
                  {cancelling ? (
                    <ActivityIndicator size="small" color="#dc2626" style={{ marginRight: 12 }} />
                  ) : (
                    <Text className="text-punchRed text-left font-semibold text-base">
                      Cancel Subscription
                    </Text>
                  )}
                </TouchableOpacity>
              ) : null}
            </View>
          </>
        )}



        {/* Cancellation Confirmation Modal */}
        <Modal
          visible={showCancelModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowCancelModal(false)}
        >
          <View className="flex-1 bg-black bg-opacity-50 justify-center items-center px-6">
            <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
              <Text className="text-xl font-semibold text-[#222] text-center mb-4">
                Are you sure you want to cancel?
              </Text>
              
              <Text className="text-base text-[#666] text-center mb-6 leading-5">
                You'll lose access to premium features at the end of your current billing period. You can resubscribe anytime from your account settings.
              </Text>

              <View className="flex-row space-x-3">
                <TouchableOpacity
                  className="flex-1 py-3 px-4 border border-[#ddd] rounded-xl"
                  onPress={() => setShowCancelModal(false)}
                >
                  <Text className="text-base text-[#666] text-center font-medium">
                    Cancel
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  className="flex-1 py-3 px-4 bg-punchRed rounded-xl"
                  onPress={confirmCancelSubscription}
                >
                  <Text className="text-base text-white text-center font-medium">
                    Yes, Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
                </>
            )
        }           

      
      </ScrollView>
    </CustomSafeAreaView>
  );
};

export default ManageSubscriptionsScreen;