import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Loader from './Components/Loader';
import Marks from './Components/Marks';
import AddMarks from './Components/AddMarks';
import CustomTabBar from './Components/CustomTabBar';
import Homework from './Components/Homework';
import AddHomework from './Components/AddHomework';
import Teachers from './Components/Teachers';
import AddTeachers from './Components/AddTeachers';
import Settings from './Components/Settings';
const Stack = createStackNavigator();
const Tab   = createBottomTabNavigator();

/* --- нижние вкладки --- */
function MyTabs() {
  return (
    <Tab.Navigator
      initialRouteName="MarksTab"            // ← откроется сразу Marks
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="MarksTab"   component={Marks}     />
      <Tab.Screen name="HomeTab"   component={Homework}     />
      <Tab.Screen name="TeachersTab"   component={Teachers}     />
    </Tab.Navigator>
  );
}

/* --- корневой стек --- */
export default function App() {
  const [loaderEnded, setLoaderEnded] = useState(false);

  return (
    <NavigationContainer>
      {!loaderEnded ? (
        <Loader onEnd={() => setLoaderEnded(true)} />
      ) : (
        <Stack.Navigator
          initialRouteName="Tabs"            // ← должен совпадать с экраном ниже
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Tabs" component={MyTabs} />
          <Stack.Screen name="AddMarks" component={AddMarks} />
          <Stack.Screen name="AddHomework" component={AddHomework} />
          <Stack.Screen name="AddTeachers" component={AddTeachers} />
          <Stack.Screen name="Settings" component={Settings} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
