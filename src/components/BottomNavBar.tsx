import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Home, Rss, Plus, Trophy, User } from 'lucide-react-native';

const BottomNavBar = () => {
  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        
        {/* Home Item */}
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
          <Home color="#A99B96" size={24} strokeWidth={1.5} />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        {/* Reports Item */}
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
          <Rss color="#A99B96" size={24} strokeWidth={1.5} />
          <Text style={styles.navText}>Reports</Text>
        </TouchableOpacity>

        {/* Center Action Button with Glow */}
        <View style={styles.centerContainer}>
          <View style={styles.glow} />
          <TouchableOpacity style={styles.centerButton} activeOpacity={0.8}>
            <Plus color="#FFFFFF" size={32} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Rank Item */}
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
          <Trophy color="#A99B96" size={24} strokeWidth={1.5} />
          <Text style={styles.navText}>Rank</Text>
        </TouchableOpacity>

        {/* Profile Item */}
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
          <User color="#A99B96" size={24} strokeWidth={1.5} />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
        
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // This container wrapper is positioned absolutely to float at the bottom of the screen
    position: 'absolute',
    bottom: 24, // adjust this depending on safe area insets
    left: 20,
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly', // perfectly symmetrical spacing
    alignItems: 'center',
    backgroundColor: '#3E2723', // Dark brown pill shape
    borderRadius: 40,
    width: '100%',
    height: 70, // Fixed height for the pill
    // Subtle shadow for the pill itself
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1, // Using flex 1 ensures each segment takes up perfectly equal width
  },
  navText: {
    color: '#A99B96', // Light beige/brown text
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    // The center container doesn't use flex: 1 so it maintains exact sizing 
    // and doesn't stretch, allowing the other items to flex evenly around it.
    width: 70, 
  },
  glow: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(216, 67, 21, 0.3)', // Warm orange transparent base
    // Extensive shadow to create the glow effect
    shadowColor: '#D84315', 
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 15,
    ...Platform.select({
      android: {
        elevation: 10,
        // Optional: on Android, shadow color coloring doesn't always pop as well,
        // so we rely on the semi-transparent background to help simulate the glow.
      },
    }),
  },
  centerButton: {
    width: 58,
    height: 58,
    borderRadius: 29, // perfectly circular
    backgroundColor: '#D84315', // Lighter warm-brown/orange
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    shadowColor: '#D84315',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
});

export default BottomNavBar;
