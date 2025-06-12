import React from "react";
import { View, ViewProps } from "react-native";

interface CustomScaffoldProps extends ViewProps {
    children: React.ReactNode;
    className?: string;
}

const CustomScaffold: React.FC<CustomScaffoldProps> = ({children, className, ...rest}) => {
    return (
        <View className={className ?? 'flex-1 bg-white mx-5'} {...rest}>{children}</View>
    )
}

export default CustomScaffold;