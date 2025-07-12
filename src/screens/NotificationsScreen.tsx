import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  FlatList,
  ListRenderItemInfo,
} from "react-native";
import NotificationItem from "../components/NotificationItem";
import CustomSafeAreaView from "../components/CustomSafeAreaView";
import Header from "../components/Header";
import { notificationService } from "../services/notificationsService";

type Notification = {
  id: string;
  text: string;
  timeAgo: string;
  timestamp: Date | string;
  read?: boolean;
};

type NotificationsByDay = {
  [section: string]: Notification[];
};

function groupByDay(notifications: Notification[]): NotificationsByDay {
  const now = new Date();
  const sections: NotificationsByDay = {};

  notifications.forEach((notif) => {
    const notifDate = new Date(notif.timestamp);
    const notifDay = new Date(
      notifDate.getFullYear(),
      notifDate.getMonth(),
      notifDate.getDate()
    );
    const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.floor(
      (nowDay.getTime() - notifDay.getTime()) / (1000 * 60 * 60 * 24)
    );

    let section = "";
    if (diffDays === 0) {
      section = "Today";
    } else if (diffDays === 1) {
      section = "Yesterday";
    } else if (diffDays === 2) {
      section = "Two days ago";
    } else {
      section = notifDate.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }

    if (!sections[section]) {
      sections[section] = [];
    }
    sections[section].push(notif);
  });

  return sections;
}

const NotificationsScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // To prevent marking as read multiple times
  const markedAsReadRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    async function fetchNotifs() {
      try {
        setLoading(true);
        const data = await notificationService.getNotifications();
        console.log("Fetched notifications:", data);
        const formatted = (data ?? []).map((n: any) => ({
          ...n,
          timestamp: n.timestamp ? new Date(n.timestamp) : new Date(),
        }));
        setNotifications(formatted);
      } catch (e: any) {
        setError(e?.message || "Could not fetch notifications.");
        Alert.alert("Error", e?.message || "Could not fetch notifications.");
      } finally {
        setLoading(false);
      }
    }
    fetchNotifs();
  }, []);

  // FlatList wants a flat array, so group, then flatten with section headers
  const notificationsByDay = groupByDay(notifications);
  const flatListData: Array<
    { type: "header"; section: string } | { type: "notif"; notif: Notification }
  > = [];
  Object.keys(notificationsByDay).forEach((section) => {
    flatListData.push({ type: "header", section });
    notificationsByDay[section].forEach((notif) =>
      flatListData.push({ type: "notif", notif })
    );
  });

  // Mark notifications as read when they become visible
  const onViewableItemsChanged = useCallback(
    ({
      viewableItems,
    }: {
      viewableItems: Array<ListRenderItemInfo<any>["item"]>;
    }) => {
      viewableItems.forEach((item) => {
        if (
          item.type === "notif" &&
          !item.notif.read &&
          !markedAsReadRef.current.has(item.notif.id)
        ) {
          markedAsReadRef.current.add(item.notif.id);
          notificationService
            .markAsRead(item.notif.id)
            .then(() => {
              setNotifications((prev) =>
                prev.map((n) =>
                  n.id === item.notif.id ? { ...n, read: true } : n
                )
              );
            })
            .catch(() => {
              // Optional: handle error, maybe remove from markedAsReadRef to retry later
            });
        }
      });
    },
    []
  );

  if (loading) {
    return (
      <CustomSafeAreaView>
        <Header title="Notifications" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#009688" />
        </View>
      </CustomSafeAreaView>
    );
  }

  if (error) {
    return (
      <CustomSafeAreaView>
        <Header title="Notifications" />
        <View className="flex-1 items-center justify-center">
          <Text className="text-red-600">{error}</Text>
        </View>
      </CustomSafeAreaView>
    );
  }
  // Empty state handling
  if (notifications.length === 0) {
    return (
      <CustomSafeAreaView>
        <Header title="Notifications" />
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-400 text-base">No notifications yet</Text>
        </View>
      </CustomSafeAreaView>
    );
  }

  return (
    <CustomSafeAreaView>
      <Header title="Notifications" />
      <FlatList
        data={flatListData}
        keyExtractor={(item, idx) =>
          item.type === "header" ? `header-${item.section}` : item.notif.id
        }
        renderItem={({ item }) =>
          item.type === "header" ? (
            <Text className="p-4 text-xs font-bold text-[#777] uppercase">
              {item.section}
            </Text>
          ) : (
            <NotificationItem
              key={item.notif.id}
              text={item.notif.text}
              timeAgo={item.notif.timeAgo}
              read={item.notif.read}
            />
          )
        }
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        className="bg-white flex-1"
      />
    </CustomSafeAreaView>
  );
};

export default NotificationsScreen;
