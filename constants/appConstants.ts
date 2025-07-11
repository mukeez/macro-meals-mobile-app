import * as Application from 'expo-application';

export const appConstants = () => {
  const version =
    Application.nativeApplicationVersion || 'unknown';

  return {
    email: {
      to: 'support@macromealsapp.com',
      subject: `Feedback – Macro Meals v${version}`,
      body: 'Hi MacroMeals team, I wanted to share some feedback about the app...',
    }
  };
};

