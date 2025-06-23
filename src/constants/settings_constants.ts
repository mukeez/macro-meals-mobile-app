
import { IMAGE_CONSTANTS } from './imageConstants';

export const SETTINGS_SECTIONS = [
  {
    key: 'personal',
    title: 'PERSONAL',
    data: [
      { icon: IMAGE_CONSTANTS.personIcon, label: 'Account settings', screen: 'AccountSettings' },
      { icon: IMAGE_CONSTANTS.fireIcon, label: 'Adjust targets', screen: 'AdjustTargets' },
      { icon: IMAGE_CONSTANTS.lockIcon, label: 'Password', screen: 'Password' },
      { icon: IMAGE_CONSTANTS.balanceIcon, label: 'Units', type: 'picker' },
    ],
  },
  {
    key: 'account',
    title: 'ACCOUNT',
    data: [
      { icon: IMAGE_CONSTANTS.accountTypeIcon, label: 'Account type', value: 'Premium', valueColor: '#F5B300', showChevron: false },
      { icon: IMAGE_CONSTANTS.restoreIcon, label: 'Restore purchases', screen: 'RestorePurchases' },
    ],
  },
  {
    key: 'notifications',
    title: 'NOTIFICATIONS',
    data: [
      { icon: IMAGE_CONSTANTS.notificationIcon, label: 'Notifications', screen: 'Notifications' },
    ],
  },
  {
    key: 'help',
    title: 'HELP & SUPPORT',
    data: [
      { icon: IMAGE_CONSTANTS.supportAgentIcon, label: 'Contact support', action: 'contactSupport' },
      { icon: IMAGE_CONSTANTS.chatIcon, label: 'Submit feedback', action: 'submitFeedback' },
      { icon: IMAGE_CONSTANTS.knowledgeIcon, label: 'Knowledge base', badge: 'Coming soon', showChevron: false },
    ],
  },
  {
    key: 'general',
    title: 'GENERAL',
    data: [
      { icon: IMAGE_CONSTANTS.fileIcon, label: 'Terms and conditions', screen: 'TermsOfService' },
      { icon: IMAGE_CONSTANTS.fileIcon, label: 'Privacy Policy', screen: 'PrivacyPolicy' },
      { icon: IMAGE_CONSTANTS.infoIcon, label: 'About', screen: 'About' },
    ],
  },
]; 