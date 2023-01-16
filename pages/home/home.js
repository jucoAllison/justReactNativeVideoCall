import React, {useState} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/core';

const Home = () => {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');

  return (
    <View>
      <Text style={{color: 'red'}}>Join Room</Text>
      <TouchableOpacity
        onPress={() => navigation.navigate('Video', {id: '123asd'})}
        style={{backgroundColor: 'blue'}}>
        <Text style={{color: '#fff'}}>Click To Join</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Home;
