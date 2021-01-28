import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('screen');
const API_KEY = '563492ad6f91700001000001f883fd1f27f04dcf901f561fa8c0d80d';
const API_URL = 'https://api.pexels.com/v1/search?query=nature&orientation=portrait&size=small&per_page=20'
const IMAGE_SIZE = 80;
const SPACING = 8;

const fetchImagesFromPexels = async () => {
  const data = await fetch(API_URL, {
    headers: {
      'Authorization': API_KEY
    }
  });

  const { photos } = await data.json();
  return photos;
}

export default function App() {
  const [images, setImages] = useState();

  useEffect(() => {
    const fetchImages = async () => {
      const images = await fetchImagesFromPexels();
      
      setImages(images);
    }
    fetchImages();
  }, []);

  const topRef = useRef();
  const dotRef = useRef();
  const [activeIndex, setActiveIndex] = useState(0);

  const setIndex = (index) => {
    setActiveIndex(index);
    topRef.current.scrollToOffset({
      offset: index * width,
      animated: true
    })
    if(index * (IMAGE_SIZE + SPACING) - IMAGE_SIZE / 2 > width / 2) {
      dotRef.current.scrollToOffset({
        offset: index * (IMAGE_SIZE + SPACING) - width / 2 + IMAGE_SIZE / 2,
        animated: true 
      })
    } else {
      dotRef.current.scrollToOffset({
        offset: 0,
        animated: true 
      })
    }
  }

  if(!images) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size='large' color='red' />
      </View>
    )
  }
  
  return (
    <View style={styles.container}>
      <FlatList
        ref={topRef}
        data={images}
        keyExtractor={item => item.id.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={ev => {
          setIndex(Math.floor(ev.nativeEvent.contentOffset.x / width))
        }}
        renderItem={({item}) => {
          return (
            <View style={{width, height}}>
              <Image
                source={{uri: item.src.portrait}}
                style={[StyleSheet.absoluteFillObject]}
              />
            </View>
          )
        }}
      />
      <FlatList
        ref={dotRef}
        style={styles.dots}
        data={images}
        keyExtractor={item => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{padding: SPACING}}
        renderItem={({item, index}) => {
          return (
            <TouchableOpacity
              onPress={() => setIndex(index)}
              activeOpacity={0.7}
            >
              <Image
                source={{uri: item.src.small}}
                style={{
                  width: IMAGE_SIZE,
                  height: IMAGE_SIZE,
                  borderRadius: 6,
                  marginRight: SPACING,
                  borderWidth: 2,
                  borderColor: activeIndex === index ? '#fff' : 'transparent'
                }}
              />
            </TouchableOpacity>
          )
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  dots: {
    position: 'absolute',
    bottom: IMAGE_SIZE / 2
  },
});
