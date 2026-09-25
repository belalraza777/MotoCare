import React from 'react'
import { View, Text } from 'react-native'
import { useLocalSearchParams } from 'expo-router';

export default function Index() {

  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View>
      <Text>Bike Details for ID:- {id}</Text>
    </View>
  )
}
