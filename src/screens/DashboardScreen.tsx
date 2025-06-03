import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import useStore from '../store/useStore';
import CustomSafeAreaView  from '../components/CustomSafeAreaView';
import { IMAGE_CONSTANTS } from '../constants/imageConstants';
import CustomTouchableOpacityButton from '../components/CustomTouchableOpacityButton';

type RootStackParamList = {
    MacroInput: undefined;
    Scan: undefined;
    MealLog: {
        date: string;
    };
    Settings: undefined;
    SettingsScreen: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const DashboardScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();

    // State for user data
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [macros, setMacros] = useState({
        protein: 0,
        carbs: 0,
        fat: 0,
        calories: 0
    });
    const [consumed, setConsumed] = useState({
        protein: 0,
        carbs: 0,
        fat: 0,
        calories: 0
    });
    const [todayMeals, setTodayMeals] = useState([]);
    const [username, setUsername] = useState('User');
    const [progress, setProgress] = useState(0);

    const userId = useStore((state) => state.userId);
    const token = useStore((state) => state.token);
    const preferences = useStore((state) => state.preferences);

    useEffect(() => {
        if (preferences.calories === 0 && preferences.protein === 0) {
            navigation.navigate('MacroInput');
        }
    }, [preferences]);

    useEffect(() => {
        const fetchUserData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                if (!token) {
                    throw new Error('Authentication token not available');
                }

                // 1. Fetch user profile info
                const profileResponse = await fetch('https://api.macromealsapp.com/api/v1/user/me', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!profileResponse.ok) {
                    throw new Error('Failed to fetch user profile');
                }

                const profileData = await profileResponse.json();
                setUsername(profileData.display_name || profileData.email.split('@')[0]);

                const prefsResponse = await fetch('https://api.macromealsapp.com/api/v1/user/preferences', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!prefsResponse.ok) {
                    throw new Error('Failed to fetch user preferences');
                }

                const prefsData = await prefsResponse.json();
                console.log('THIS IS THE PREFS DATA', prefsData);
                setMacros({
                    protein: prefsData.protein_target,
                    carbs: prefsData.carbs_target,
                    fat: prefsData.fat_target,
                    calories: prefsData.calorie_target
                });

                const progressResponse = await fetch('https://api.macromealsapp.com/api/v1/meals/progress/today', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!progressResponse.ok) {
                    throw new Error('Failed to fetch daily progress');
                }

                const progressData = await progressResponse.json();
                console.log('THIS IS THE PROGRESS DATA', progressData);

                setConsumed({
                    protein: progressData.logged_macros.protein,
                    carbs: progressData.logged_macros.carbs,
                    fat: progressData.logged_macros.fat,
                    calories: progressData.logged_macros.calories
                });

                const overallProgress = Object.values(progressData.progress_percentage as Record<string, number>).reduce(
                    (sum: number, value: number) => sum + value, 0
                ) / Object.values(progressData.progress_percentage as Record<string, number>).length;

                setProgress(Math.round(overallProgress));
                const todayMealsResponse = await fetch('https://api.macromealsapp.com/api/v1/meals/today', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!todayMealsResponse.ok){
                    throw new Error('Failed to fetch today\'s meals');
                }
                const todayMealsData = await todayMealsResponse.json();
                console.log('THIS IS THE TODAY MEALS DATA', todayMealsData);
                setTodayMeals(todayMealsData);
                setIsLoading(false);

            } catch (error) {
                console.error('Error fetching user data:', error);
                setError('Failed to load your data. Please try again.');
                setIsLoading(false);

                // Fallback to existing preferences from the store
                // in case the API calls fail
                if (preferences) {
                    setMacros({
                        protein: preferences.protein || 0,
                        carbs: preferences.carbs || 0,
                        fat: preferences.fat || 0,
                        calories: preferences.calories || 0
                    });
                }
            }
        };

        fetchUserData();
    }, [userId, token]);

    const handleMacroInput = () => {
        navigation.navigate('MacroInput');
    };

    const handleScan = () => {
        navigation.navigate('Scan');
    };

    const handleMealLog = (date: string) => {
        navigation.navigate('MealLog', { date });
    };

    const handleRefresh = () => {
        setIsLoading(true);
    };

    const handleSettings = () => {
        navigation.navigate('Settings');
    };

    const handleSettingsScreen = () => {
        navigation.navigate('SettingsScreen');
    };

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#19a28f" />
                <Text style={styles.loadingText}>Loading your dashboard...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const remaining = {
        protein: Math.max(0, macros.protein - consumed.protein),
        carbs: Math.max(0, macros.carbs - consumed.carbs),
        fat: Math.max(0, macros.fat - consumed.fat),
        calories: Math.max(0, macros.calories - consumed.calories)
    };

    const proteinProgress = Math.min(100, Math.round((consumed.protein / macros.protein) * 100) || 0);
    const carbsProgress = Math.min(100, Math.round((consumed.carbs / macros.carbs) * 100) || 0);
    const fatProgress = Math.min(100, Math.round((consumed.fat / macros.fat) * 100) || 0);

function formatDate(date: Date){
    const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
    }
    const formattedDate = date.toLocaleDateString('en-US', options);
    const parts = formattedDate.split(', ');
    const dayOfWeek = parts[0];
    const monthAndDate = parts[1];
    const [month, day] = monthAndDate.split(' ');
    return `${dayOfWeek}, ${day} ${month}`;
}

    return (
        <CustomSafeAreaView edges={['left', 'right']} paddingOverride={{bottom: -25}}>
            <View className='flex-1 bg-[#F5F5F5] mt-4'>
                <View className='flex-row items-center justify-between px-5 pb-4 bg-white'>
                    <View className='flex-col items-start gap-2'>
                        <Text className='text-[13px] font-normal'>{formatDate(new Date())} 🌞</Text>
                        <Text className='text-[18px] font-medium text-black'>Good morning, {username}!</Text>
                    </View>
                    <Image source={IMAGE_CONSTANTS.notificationIcon} className='w-[24px] h-[24px] object-fill' />
                </View>
                <View className='flex-col bg-paleCyan px-5 py-5 mb-8'>
                <Image tintColor={'#8BAAA3'} source={IMAGE_CONSTANTS.trophy}  className='absolute bottom-4 tint right-4 w-[74px] h-[74px] object-fill' />
                    <View className='relative'>
                        <Text className='text-base font-semibold mb-2'>Set up your Macro goals</Text>
                        <Text className='tracking-wide text-[13px] font-normal mb-3 mr-10'>Set your macro goals to get personalized tracking and tailored recommendations.</Text>
                        <TouchableOpacity className='bg-primary w-[105px] h-[32px] rounded-[100px] justify-center items-center' onPress={handleSettingsScreen}>
                            <Text className='text-white text-sm font-semibold'>Set up now</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View className='flex-col bg-white px-5 py-6 mb-4'>
                    <Text className='text-[18px] font-semibold'>Recently uploaded</Text>
                    {todayMeals.length === 0 ? (
                        <View className='flex-col items-center justify-center h-[150px] mx-20'>
                            <Text className='tracking-normal leading-5 text-[14px] font-medium text-center'>Your recently logged meals for the day will show up here</Text>
                        </View>
                    ): (
                        <View className='flex-col'></View>
                    )}

                </View>
                
            </View>
        </CustomSafeAreaView>
    )



    // return (
    //     <CustomSafeAreaView edges={['left', 'right']} paddingOverride={{bottom: -25}}>
    //     <View style={styles.container}>
    //         <View style={styles.header}>
    //             <View style={styles.logoContainer}>
    //                 <View style={styles.logoBox}>
    //                     <Text style={styles.logoIcon}>🍽️</Text>
    //                 </View>
    //                 <Text style={styles.logoText}>MacroMate</Text>
    //             </View>
    //             <TouchableOpacity
    //                 style={styles.profileButton}
    //                 onPress={() => navigation.navigate('Settings')}
    //             >
    //                 <Text style={styles.profileText}>👤</Text>
    //             </TouchableOpacity>
    //         </View>

    //         <ScrollView style={styles.scrollView}>
    //             <View style={styles.greetingContainer}>
    //                 <Text style={styles.greeting}>Hey {username}! <Text>👋</Text></Text>
    //                 <Text style={styles.subGreeting}>Let's track your macros for today</Text>
    //             </View>

    //             <View style={styles.progressContainer}>
    //                 <View style={styles.progressHeader}>
    //                     <Text style={styles.progressTitle}>Today's Progress</Text>
    //                     <Text style={styles.progressPercentage}>{progress}%</Text>
    //                 </View>

    //                 <View style={styles.macroCirclesContainer}>
    //                     <View style={styles.macroItem}>
    //                         <View style={styles.macroCircle}>
    //                             <View style={[styles.macroProgress, { backgroundColor: '#19a28f', height: `${proteinProgress}%` }]} />
    //                             <View style={styles.macroInnerCircle}>
    //                                 <Text style={styles.macroValue}>{consumed.protein}g</Text>
    //                             </View>
    //                         </View>
    //                         <Text style={styles.macroLabel}>Protein</Text>
    //                     </View>

    //                     <View style={styles.macroItem}>
    //                         <View style={styles.macroCircle}>
    //                             <View style={[styles.macroProgress, { backgroundColor: '#f5a623', height: `${carbsProgress}%` }]} />
    //                             <View style={styles.macroInnerCircle}>
    //                                 <Text style={styles.macroValue}>{consumed.carbs}g</Text>
    //                             </View>
    //                         </View>
    //                         <Text style={styles.macroLabel}>Carbs</Text>
    //                     </View>

    //                     <View style={styles.macroItem}>
    //                         <View style={styles.macroCircle}>
    //                             <View style={[styles.macroProgress, { backgroundColor: '#ff6b6b', height: `${fatProgress}%` }]} />
    //                             <View style={styles.macroInnerCircle}>
    //                                 <Text style={styles.macroValue}>{consumed.fat}g</Text>
    //                             </View>
    //                         </View>
    //                         <Text style={styles.macroLabel}>Fats</Text>
    //                     </View>
    //                 </View>

    //                 <View style={styles.caloriesSummary}>
    //                     <View style={styles.caloriesRow}>
    //                         <Text style={styles.caloriesLabel}>Calories Consumed</Text>
    //                         <Text style={styles.caloriesValue}>{consumed.calories}</Text>
    //                     </View>
    //                     <View style={styles.caloriesRow}>
    //                         <Text style={styles.caloriesLabel}>Remaining</Text>
    //                         <Text style={[styles.caloriesValue, styles.remainingValue]}>
    //                             {remaining.calories}
    //                         </Text>
    //                     </View>
    //                 </View>
    //             </View>

    //             <TouchableOpacity style={styles.actionButton} onPress={handleMacroInput}>
    //                 <Text style={styles.actionButtonText}>+ Log a Meal</Text>
    //             </TouchableOpacity>

    //             <TouchableOpacity
    //                 style={[styles.actionButton, styles.findMealsButton]}
    //                 onPress={handleScan}
    //             >
    //                 <Text style={styles.actionButtonText}>📍 Find Meals Near Me</Text>
    //             </TouchableOpacity>

    //             <TouchableOpacity
    //                 style={[styles.actionButton, styles.mealLogButton]}
    //                 onPress={() => handleMealLog(new Date().toISOString().split('T')[0])}
    //             >
    //                 <Text style={styles.mealLogButtonText}>🕒 Meal Log</Text>
    //             </TouchableOpacity>
    //         </ScrollView>

    //         <View style={styles.bottomNav}>
    //             <TouchableOpacity style={styles.navItem}>
    //                 <Text style={styles.navIcon}>🏠</Text>
    //                 <Text style={styles.navActiveText}>Home</Text>
    //             </TouchableOpacity>

    //             <TouchableOpacity
    //                 style={styles.navItem}
    //                 onPress={() => Alert.alert('Stats', 'Stats coming soon!')}
    //             >
    //                 <Text style={styles.navIcon}>📊</Text>
    //                 <Text style={styles.navText}>Stats</Text>
    //             </TouchableOpacity>

    //             <TouchableOpacity
    //                 style={styles.navItem}
    //                 onPress={handleMacroInput}
    //             >
    //                 <Text style={styles.navIcon}>➕</Text>
    //                 <Text style={styles.navText}>Log</Text>
    //             </TouchableOpacity>

    //             <TouchableOpacity
    //                 style={styles.navItem}
    //                 onPress={() => navigation.navigate('SettingsScreen')}
    //             >
    //                 <Text style={styles.navIcon}>⚙️</Text>
    //                 <Text style={styles.navText}>Settings</Text>
    //             </TouchableOpacity>
    //         </View>
    //     </View>
    //     </CustomSafeAreaView>
    // );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    errorText: {
        fontSize: 16,
        color: '#ff6b6b',
        marginBottom: 16,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#19a28f',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    retryButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoBox: {
        width: 40,
        height: 40,
        backgroundColor: '#19a28f',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoIcon: {
        fontSize: 22,
        color: 'white',
    },
    logoText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#19a28f',
        marginLeft: 8,
    },
    profileButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f1f1f1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileText: {
        fontSize: 24,
    },
    scrollView: {
        flex: 1,
        padding: 20,
    },
    greetingContainer: {
        marginBottom: 24,
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    subGreeting: {
        fontSize: 16,
        color: '#666',
        marginTop: 4,
    },
    progressContainer: {
        backgroundColor: '#f9f9f9',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    progressTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    progressPercentage: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#19a28f',
    },
    macroCirclesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
    },
    macroItem: {
        alignItems: 'center',
    },
    macroCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f1f1f1',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        overflow: 'hidden',
    },
    macroProgress: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
    },
    macroInnerCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    macroValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    macroLabel: {
        fontSize: 14,
        color: '#666',
    },
    caloriesSummary: {
        borderTopWidth: 1,
        borderTopColor: '#eeeeee',
        paddingTop: 16,
        marginTop: 8,
    },
    caloriesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    caloriesLabel: {
        fontSize: 16,
        color: '#666',
    },
    caloriesValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    remainingValue: {
        color: '#19a28f',
    },
    actionButton: {
        backgroundColor: '#19a28f',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 16,
    },
    actionButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    findMealsButton: {
        backgroundColor: '#f5a623',
    },
    mealLogButton: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    mealLogButtonText: {
        color: '#333',
        fontSize: 18,
        fontWeight: '500',
    },
    bottomNav: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#eeeeee',
        paddingVertical: 8,
    },
    navItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
    },
    navIcon: {
        fontSize: 22,
        marginBottom: 4,
    },
    navText: {
        fontSize: 12,
        color: '#666',
    },
    navActiveText: {
        fontSize: 12,
        color: '#19a28f',
        fontWeight: 'bold',
    },
});