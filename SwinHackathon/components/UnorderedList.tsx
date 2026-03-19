import AntDesign from '@expo/vector-icons/AntDesign';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface UnorderedListProps {
  items: string[];
}

const UnorderedList: React.FC<UnorderedListProps> = ({ items }) => (
    <View style={styles.listContainer}>
        {items.map((item, index) => (
            <View key={index} style={styles.listItem}>
                <AntDesign name="check-circle" size={18} style={{marginLeft:8}} color="black" />
                <Text style={styles.itemText}> {item}</Text>
            </View>
        ))}
    </View>
);

const styles = StyleSheet.create({
  listContainer: {
    marginLeft: 20, // Add some left margin for indentation
  },
  listItem: {
    flexDirection: 'row', // Align bullet and text horizontally
    alignItems: 'flex-start',
    marginVertical: 4, // Add some vertical spacing
  },
  bullet: {
    marginRight: 10,
    fontSize: 16, // Adjust bullet size as needed
  },
  itemText: {
    flexShrink: 1, // Allows text to wrap within the available space
  },
});

export default UnorderedList;