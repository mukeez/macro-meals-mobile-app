import React from "react";
import { useState } from "react";
import { View, ViewProps } from "react-native";
import PagerView from 'react-native-pager-view';

interface CustomPagerViewProps extends ViewProps {
    children: React.ReactNode[];
    className?: string;
    indicatorActiveColor?: string;
    indicatorInactiveColor?: string;
}

export default function CustomPagerView({children, className, indicatorActiveColor, indicatorInactiveColor, ...rest}: CustomPagerViewProps){
    const [currentPage, setCurrentPage] = useState(0);
    return(
        <View className={className ?? 'flex-1 bg-white mx-5'} {...rest}>
        <PagerView
        style={{ flex: 1}} 
        orientation='horizontal'
        onPageSelected={(e)=> {
          setCurrentPage(e.nativeEvent.position);
        }}
        initialPage={0}
        >
            {children}
        </PagerView>
        <View className="absolute bottom-4 w-full flex-row gap-2 justify-center items-center">
        {Array.from({length: children.length}).map((_, index)=> (
          <View key={index} className={`w-[10px] h-[10px] rounded-full ${index === currentPage ? indicatorActiveColor ?? 'bg-black' : indicatorInactiveColor ?? 'bg-lightGrey'}`}
          />
        ))}
      </View>
        </View>
    )
}