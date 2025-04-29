// Components/CustomTabBar.js
import React from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Text,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';

const { width } = Dimensions.get('window');

// UI-цвета и градиенты
const CONTAINER_BG   = '#FFFFFF';
const PILL_BG        = '#FFFFFF';
const BORDER_CLR     = '#E1E6';
const INACTIVE_CLR   = '#9E9EA6';
const GRADIENT       = ['#A544FF', '#FF1DEC'];

export default function CustomTabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();

  const handleAddPress = () => {
    const current = state.routes[state.index].name;
  
    if (current === 'MarksTab') {
      navigation.navigate('AddMarks');
    } else if (current === 'HomeTab') {
      navigation.navigate('AddHomework');
      
    }else if (current === 'TeachersTab') {
        navigation.navigate('AddTeachers');} 
    else {
      // fallback
      navigation.navigate('AddMarks');
    }
  };
  

  return (
    <LinearGradient colors={GRADIENT} start={{ x:0,y:0 }} end={{ x:1,y:0 }}>
      <View style={[styles.tabBar, { paddingBottom: insets.bottom }]}>
        
        {/* Вся градиентная панель кликабельна */}
        <TouchableOpacity
          style={styles.addButtonContainer}
          activeOpacity={0.8}
          onPress={handleAddPress}
        >
          <LinearGradient
            colors={GRADIENT}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.addButtonGradient}
          >
            <Text style={styles.addButtonText}>Add</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Нижняя “таблетка” */}
        <View style={styles.pill}>
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            let iconSource, label;
            switch (route.name) {
              case 'MarksTab':
                iconSource = require('../assets/marks.png');
                label = 'Marks';
                break;
              case 'HomeTab':
                iconSource = require('../assets/homework.png');
                label = 'Homework';
                break;
              case 'TeachersTab':
                iconSource = require('../assets/teachers.png');
                label = 'Teachers';
                break;
            }
            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
              });
              if (!event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };
            return (
              <TouchableOpacity
                key={route.key}
                style={styles.tabItem}
                onPress={onPress}
                activeOpacity={0.8}
              >
                {isFocused ? (
                  <MaskedView
                    maskElement={<Image source={iconSource} style={styles.icon} />}
                  >
                    <LinearGradient
                      colors={GRADIENT}
                      style={styles.icon}
                      start={{ x:0,y:0 }} end={{ x:1,y:0 }}
                    />
                  </MaskedView>
                ) : (
                  <Image
                    source={iconSource}
                    style={[styles.icon, { tintColor: INACTIVE_CLR }]}
                  />
                )}
                <Text style={[
                  styles.label,
                  { color: isFocused ? GRADIENT[1] : INACTIVE_CLR }
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    paddingTop: 20,
    backgroundColor: CONTAINER_BG,
    alignItems: 'center',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonContainer: {
    width: width * 0.94,
    height: 50,
    marginBottom: 10,
    borderRadius: 25,
  },
  addButtonGradient: {
    flex: 1,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  pill: {
    flexDirection: 'row',
    width: width * 0.94,
    height: 60,
    backgroundColor: PILL_BG,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: BORDER_CLR,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 26,
    height: 26,
    resizeMode: 'contain',
  },
  label: {
    fontSize: 12,
    marginTop: 4,
  },
});
