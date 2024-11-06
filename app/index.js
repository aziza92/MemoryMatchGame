import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import GameBoard from '../components/GameBoard';

export default function App() {
  const [level, setLevel] = useState(1);
  const [totalScore, setTotalScore] = useState(0);

  useEffect(() => {
    loadGameState();
  }, []);

  useEffect(() => {
    saveGameState();
  }, [level, totalScore]);

  const loadGameState = async () => {
    try {
      const savedLevel = await AsyncStorage.getItem('level');
      const savedScore = await AsyncStorage.getItem('totalScore');
      
      if (savedLevel !== null) {
        setLevel(parseInt(savedLevel));
      }
      if (savedScore !== null) {
        setTotalScore(parseInt(savedScore));
      }
    } catch (error) {
      console.error('Error loading game state', error);
    }
  };

  const saveGameState = async () => {
    try {
      await AsyncStorage.setItem('level', level.toString());
      await AsyncStorage.setItem('totalScore', totalScore.toString());
    } catch (error) {
      console.error('Error saving game state', error);
    }
  };

  const handleNextLevel = (levelScore) => {
    setLevel(prevLevel => prevLevel + 1);
    setTotalScore(prevScore => prevScore + levelScore);
  };

  const handleGameOver = (finalScore, isTimeout = false) => {
      // Ne pas changer le niveau, même en cas de timeout
    setTotalScore(prevScore => prevScore + finalScore);
  };

  return (
    <PaperProvider>  
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>MemoMatch 🧠</Text>
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Niveau: {level}</Text>
          <Text style={styles.infoText}>Score Total: {totalScore}</Text>
        </View>
        <GameBoard 
          level={level} 
          onLevelComplete={handleNextLevel}
          onGameOver={handleGameOver}
          setLevel={setLevel} 
          setTotalScore={setTotalScore} 
        />
      </SafeAreaView>
    </PaperProvider>
  );
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
    fontFamily: 'monospace', 
    color: '#003366',  
  },
  infoContainer: {
    justifyContent: 'center',
    alignItems: 'center',    
  },
  infoText: {
    marginBottom: 10,
    fontSize: 15,
    fontFamily: 'monospace', 
    color: '#003366',  
  },
  levelText: {
    fontSize: 15,
    marginBottom: 20,
    fontFamily: 'monospace', 
    color: '#003366',  
  },
});