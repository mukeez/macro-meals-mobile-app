import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, Animated } from 'react-native';
import { IMAGE_CONSTANTS } from '../constants/imageConstants';

type RateMacroMealsProps = {
    onLike?: () => Promise<void> | void;
    onDislike?: () => Promise<void> | void;
};

export const RateMacroMeals: React.FC<RateMacroMealsProps> = ({ onLike, onDislike }) => {
    const [selected, setSelected] = useState<'like' | 'dislike' | null>(null);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [hidden, setHidden] = useState<boolean>(false);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const opacity = useRef(new Animated.Value(1)).current;

    const handleLikePress = async (): Promise<void> => {
        if (submitted || submitting) return;
        setSelected('like');
        try {
            setSubmitting(true);
            await Promise.resolve(onLike?.());
            setSubmitted(true);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDislikePress = async (): Promise<void> => {
        if (submitted || submitting) return;
        setSelected('dislike');
        try {
            setSubmitting(true);
            await Promise.resolve(onDislike?.());
            setSubmitted(true);
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (submitted) {
            opacity.setValue(1);
            Animated.timing(opacity, {
                toValue: 0,
                duration: 400,
                delay: 1200,
                useNativeDriver: true,
            }).start(() => setHidden(true));
        }
    }, [submitted, opacity]);

    if (hidden) {
        return null;
    }

    if (submitted) {
        return (
            <Animated.View style={{ opacity }} className="mx-5 mt-4 bg-[#EAF7EE] border border-[#B8E6C5] rounded-lg px-4 py-3 flex-row items-center">
                <Image source={IMAGE_CONSTANTS.checkPrimary} className="w-5 h-5 mr-2" />
                <Text className="text-[#1F7A3A] text-sm font-medium">Thanks for your feedback!</Text>
            </Animated.View>
        );
    }

    return (
        <View className="flex-col justify-center items-center">
            <Text className="text-base text-black mt-4">How did Macromeals do?</Text>
            <View className="flex-row justify-center items-center gap-5 mt-4">
                <TouchableOpacity
                    onPress={handleLikePress}
                    activeOpacity={0.8}
                    className={`flex-row items-center rounded-full h-[44px] w-[44px] justify-center ${selected === 'like' ? 'bg-primary' : 'bg-primaryLight'} ${submitting ? 'opacity-60' : ''}`}
                >
                    {submitting && selected === 'like' ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Image source={IMAGE_CONSTANTS.likeLightIcon} className="w-6 h-6" />
                    )}
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleDislikePress}
                    activeOpacity={0.8}
                    className={`flex-row items-center rounded-full h-[44px] w-[44px] justify-center ${selected === 'dislike' ? 'bg-primary' : 'bg-primaryLight'} ${submitting ? 'opacity-60' : ''}`}
                >
                    {submitting && selected === 'dislike' ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Image source={IMAGE_CONSTANTS.dislikeLightIcon} className="w-6 h-6" />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};
