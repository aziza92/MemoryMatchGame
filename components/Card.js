import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';

const Card = ({ card, onPress, cardSize }) => {
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animation, {
      toValue: card.isFlipped ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [card.isFlipped]);

  const frontInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const animatedFrontStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const animatedBackStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  return (
    <TouchableOpacity  style={[styles.card, { width: cardSize, height: cardSize }]}  onPress={onPress}>
    <Animated.View style={[styles.cardInner, animatedFrontStyle]}>
      <Text style={styles.cardText}>{card.isFlipped ? card.content : '?'}</Text>
    </Animated.View>
    <Animated.View style={[styles.cardInner, styles.cardBack, animatedBackStyle]}>
      <Text style={styles.cardText}>{card.content}</Text>
    </Animated.View>
  </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    perspective: 1000, 
  },
  cardInner: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backfaceVisibility: 'hidden',
    backgroundColor: '#8032f0',
   
  },
  cardBack: {
    backgroundColor: '#7531d6',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotateY: '180deg' }],
  },
  cardText: {
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    color: 'white',
    
  },
});

export default Card;

