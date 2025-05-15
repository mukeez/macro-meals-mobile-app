import React from 'react';
import {
    ViewStyle,
    StyleSheet,
    StyleProp,
    View,
    ViewProps,
} from 'react-native';
import { 
    useSafeAreaInsets,
    SafeAreaView,
    Edge,
 } from 'react-native-safe-area-context';


 interface CustomSafeAreaViewProps extends ViewProps{
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    edges?: Edge[];
    paddingOverride?: {
        top?: number;
        bottom?: number;
        left?: number;
        right?: number;

    };
    className?: string;
 }

const CustomSafeAreaView: React.FC<CustomSafeAreaViewProps> = ({
    children,
    style,
    edges = ['left', 'right', 'bottom'],
    paddingOverride = {},
    className,
    ...rest
}) => {
    const insets = useSafeAreaInsets();
    const computedPadding = {
        paddingTop: paddingOverride.top ?? (edges.includes('top') ? insets.top : 0),
        paddingBottom: paddingOverride.bottom ?? (edges.includes('bottom') ? insets.bottom : 0),
        paddingLeft: paddingOverride.left ?? (edges.includes('left') ? insets.left : 0),
        paddingRight: paddingOverride.right ?? (edges.includes('right') ? insets.right : 0),
    }

    return (
        <SafeAreaView className={className} style={[styles.container, computedPadding, style]} {...rest}>
            {children}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
});

export default CustomSafeAreaView;

