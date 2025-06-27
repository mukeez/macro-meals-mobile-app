import React, { useEffect, useRef, useState } from "react";
import { View, ViewProps } from "react-native";
import PagerView from 'react-native-pager-view';

interface CustomPagerViewProps extends ViewProps {
    children: React.ReactNode[];
    className?: string;
    indicatorActiveColor?: string;
    indicatorInactiveColor?: string;
    indicatorClass?: string;
    showIndicator?: boolean;
    page?: number;
    /**
     * If false, disables swiping/scrolling between pages.
     * Default: true
     */
    scrollEnabled?: boolean;
}

export default function CustomPagerView({
  children, 
  className, 
  indicatorActiveColor, 
  indicatorInactiveColor, 
  indicatorClass, 
  showIndicator = true,
  page = 0,
  scrollEnabled = true,
  ...rest
}: CustomPagerViewProps){
    const [currentPage, setCurrentPage] = useState(page);
    const pagerRef = useRef<PagerView>(null);

    useEffect(() => {
      if (pagerRef.current && page !== currentPage) {
        pagerRef.current.setPage(page);
        setCurrentPage(page);
      }
    }, [page]);

    return(
        <View className={className ?? 'flex-1 bg-white mx-5'} {...rest}>
        <PagerView
          ref={pagerRef}
        style={{ flex: 1}} 
        orientation='horizontal'
        onPageSelected={(e)=> {
          setCurrentPage(e.nativeEvent.position);
        }}
        initialPage={0}
        scrollEnabled={scrollEnabled}
        >
            {children}
        </PagerView>
        <View className={indicatorClass ?? "absolute bottom-4 w-full flex-row gap-2 justify-center items-center"}>
        {
          showIndicator && (
            Array.from({length: children.length}).map((_, index)=> (
              <View key={index} className={`w-[10px] h-[10px] rounded-full ${index === currentPage ? indicatorActiveColor ?? 'bg-black' : indicatorInactiveColor ?? 'bg-lightGrey'}`}
              />
            ))
          )
        }
      </View>
        </View>
    )
}