import React from "react";
import { ScrollView, View, Text } from "react-native";
import NotificationItem from "../components/NotificationItem";
import CustomSafeAreaView from "../components/CustomSafeAreaView";
import Header from "../components/Header";

type Notification = {
  id: string;
  text: string;
  timeAgo: string;
  timestamp: Date;
};

type NotificationsByDay = {
  [section: string]: Notification[];
};

// Example notifications (replace with your actual data source as needed)
const notifications: Notification[] = [
  {
    id: "1",
    text: "Your order has been shipped.",
    timeAgo: "2m ago",
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
  },
  {
    id: "2",
    text: "New message received.",
    timeAgo: "1h ago",
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
  },
  {
    id: "3",
    text: "Your verification code: 123456",
    timeAgo: "23h ago",
    timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000),
  },
  {
    id: "4",
    text: "Password changed successfully.",
    timeAgo: "1d ago",
    timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000),
  },
  {
    id: "5",
    text: "Weekly summary is ready.",
    timeAgo: "2d ago",
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
  },
  {
    id: "6",
    text: "Welcome to our service!",
    timeAgo: "3d ago",
    timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000),
  },
];

function groupByDay(notifications: Notification[]): NotificationsByDay {
  const now = new Date();
  const sections: NotificationsByDay = {};

  notifications.forEach((notif) => {
    const notifDate = notif.timestamp;
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
  const notificationsByDay = groupByDay(notifications);

  return (
    <CustomSafeAreaView>
      <Header title="Notifications" />
      <ScrollView className="bg-white flex-1">
        {Object.keys(notificationsByDay).map((section) => (
          <View key={section}>
            <Text className="p-4 text-xs font-bold text-[#777] uppercase">
              {section}
            </Text>
            {notificationsByDay[section].map((notif) => (
              <NotificationItem
                key={notif.id}
                text={notif.text}
                timeAgo={notif.timeAgo}
              />
            ))}
          </View>
        ))}
      </ScrollView>
    </CustomSafeAreaView>
  );
};

export default NotificationsScreen;
