import { Tabs } from "expo-router";
import React from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export default function BottomTabsLayout() {
    return (
        <Tabs
            screenOptions={{ tabBarActiveTintColor: "teal" }}
            backBehavior="order"
        >
            <Tabs.Screen
                name="(dashboard)"
                options={{
                    title: "Home",
                    tabBarLabel: "Index",
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons
                            name="home"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="my-library"
                options={{
                    title: "My Library",
                    popToTopOnBlur: true,
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons
                            name="book-open-page-variant"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="statistics"
                options={{
                    title: "Statistics",
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons
                            name="chart-box-outline"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="clubs"
                options={{
                    tabBarBadge: 2,
                    tabBarBadgeStyle: {
                        backgroundColor: "tomato",
                        color: "white",
                    },
                    title: "Clubs",
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons
                            name="account-group-outline"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="theme-test"
                options={{
                    title: "Theme Test",
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons
                            name="palette-outline"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}
