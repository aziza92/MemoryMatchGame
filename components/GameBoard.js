import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Text, ScrollView, SafeAreaView, Dimensions, FlatList } from 'react-native';
import { Button } from 'react-native-paper';
import { Audio } from 'expo-av';
import Card from './Card';

const { width } = Dimensions.get('window');

const getNumberOfColumns = (level) => {
    if (level >= 5) return 5;
    if (level >= 4) return 4;
    return 3; // Valeur par défaut pour les niveaux inférieurs
};

const getCardSize = (numColumns) => (width - 70) / numColumns; 

const GameBoard = ({ level, onLevelComplete, onGameOver, setLevel, setTotalScore }) => {
    const [cards, setCards] = useState([]);
    const [selectedCards, setSelectedCards] = useState([]);
    const [matchedPairs, setMatchedPairs] = useState(0);
    const [showNextLevelButton, setShowNextLevelButton] = useState(false);
    const [score, setScore] = useState(0);
    const [timer, setTimer] = useState(50);
    const [isGameOver, setIsGameOver] = useState(false);
    const [isTimeout, setIsTimeout] = useState(false);
    const buttonAnimation = useRef(new Animated.Value(0)).current;
    const timerRef = useRef(null);

    const [flipSound, setFlipSound] = useState();
    const [matchSound, setMatchSound] = useState();
    const [gameOverSound, setGameOverSound] = useState();


    const numColumns = getNumberOfColumns(level);
    const cardSize = getCardSize(numColumns);


    useEffect(() => {
        loadSounds();
        return unloadSounds;
    }, []);

    const loadSounds = async () => {
        const flipAudio = new Audio.Sound();
        const matchAudio = new Audio.Sound();
        const gameOverAudio = new Audio.Sound();

        try {
            await flipAudio.loadAsync(require('../assets/sounds/flip.mp3'));
            await matchAudio.loadAsync(require('../assets/sounds/match.mp3'));
            await gameOverAudio.loadAsync(require('../assets/sounds/gameover.mp3'));

            setFlipSound(flipAudio);
            setMatchSound(matchAudio);
            setGameOverSound(gameOverAudio);
        } catch (error) {
            console.error('Error loading sounds', error);
        }
    };

    const unloadSounds = async () => {
        await flipSound?.unloadAsync();
        await matchSound?.unloadAsync();
        await gameOverSound?.unloadAsync();
    };

    const playSound = async (sound) => {
        try {
            await sound.replayAsync();
        } catch (error) {
            console.error('Error playing sound', error);
        }
    };

    const initializeGame = () => {
        clearInterval(timerRef.current);
        const newCards = shuffleCards(level);
        setCards(newCards);
        setMatchedPairs(0);
        setShowNextLevelButton(false);
        setScore(0);
        setTimer(50);
        setIsGameOver(false);
        setSelectedCards([]);
        startTimer();
    };

    const resetGame = () => {
        clearInterval(timerRef.current); // Arrêter le timer
        setLevel(1); // Recommencer au niveau 1
        setMatchedPairs(0); // Réinitialiser les paires trouvées
        setShowNextLevelButton(false); // Cacher le bouton de niveau suivant
        setScore(0); // Réinitialiser le score pour le niveau actuel
        setTotalScore(0); // Réinitialiser le score total
        setTimer(50); // Remettre le timer à 60 secondes
        setIsGameOver(false); // Indiquer que le jeu n'est plus terminé
        setSelectedCards([]); // Vider les cartes sélectionnées

        // Générer les cartes pour le niveau 1
        const newCards = shuffleCards(1);
        setCards(newCards);

        startTimer(); // Redémarrer le timer
    };


    useEffect(() => {
        initializeGame();
        return () => clearInterval(timerRef.current);
    }, [level]);

    useEffect(() => {
        if (showNextLevelButton) {
            Animated.timing(buttonAnimation, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
        }
    }, [showNextLevelButton]);


    const handleGameOver = (isTimeout = false) => {
        clearInterval(timerRef.current); // Arrêter le timer
        setIsGameOver(true); // Indiquer que le jeu est terminé

        // Réinitialiser les cartes pour les remettre à l'état non affiché
        resetCards(); // Retourne toutes les cartes


        // Assurer que toutes les paires sont trouvées avant de passer au niveau suivant
        const allPairsMatched = matchedPairs === (level + 2);

        if (allPairsMatched) {
            setShowNextLevelButton(true); // Affiche le bouton de niveau suivant
        }

        // Ajouter un court délai pour garantir que les cartes ont bien été réinitialisées avant de changer les cartes
        setTimeout(() => {
            // Réinitialiser les cartes avec le bon nombre basé sur le niveau actuel
            const newCards = shuffleCards(level); // Générer les cartes pour le niveau actuel
            setCards(newCards);

            if (gameOverSound) {
                playSound(gameOverSound); // Jouer le son de game over
            }

            // Notifier le parent avec un délai
            onGameOver(score, isTimeout);
        }, 500); // Assure-toi que les cartes ont le temps d'être réinitialisées
    };
    const startTimer = () => {
        timerRef.current = setInterval(() => {
            setTimer((prevTimer) => {
                if (prevTimer === 1) {
                    handleGameOver(true); // Indicate timeout
                    return 0;
                }
                return prevTimer - 1;
            });
        }, 1000);
    };

    const resetCards = () => {
        // Utiliser le setState de manière fonctionnelle pour garantir que l'état est mis à jour correctement
        setCards(prevCards => prevCards.map(card => ({ ...card, isFlipped: false })));
    };

    function shuffleCards(level) {
        const numPairs = level + 2;
        const contents = ['🍎', '🍌', '🍇', '🍓', '🍉', '🍒', '🍋', '🍍', '🥝', '🍑'].slice(0, numPairs);
        const duplicateCards = [...contents, ...contents];
        return duplicateCards.sort(() => Math.random() - 0.5).map((content) => ({
            content,
            isFlipped: false,
        }));
    }

    const handleCardPress = (index) => {
        if (isGameOver) {
            initializeGame();
            return;
        }

        playSound(flipSound);

        const newCards = [...cards];
        newCards[index].isFlipped = true;
        setCards(newCards);
        setSelectedCards([...selectedCards, index]);

        if (selectedCards.length === 1) {
            const firstIndex = selectedCards[0];
            const secondIndex = index;

            if (cards[firstIndex].content === cards[secondIndex].content) {
                const newMatchedPairs = matchedPairs + 1;
                setMatchedPairs(newMatchedPairs);
                setSelectedCards([]);
                setScore(score + 10 + Math.floor(timer / 2));

                playSound(matchSound);

                if (newMatchedPairs === level + 2) {
                    setShowNextLevelButton(true);
                    clearInterval(timerRef.current);
                }
            } else {
                setTimeout(() => {
                    newCards[firstIndex].isFlipped = false;
                    newCards[secondIndex].isFlipped = false;
                    setCards([...newCards]);
                    setSelectedCards([]);
                    setScore(Math.max(0, score - 5));
                }, 1000);
            }
        }
    };

    const buttonScale = buttonAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0.8, 1],
    });

    const buttonOpacity = buttonAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });


    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.scoreText}>Score: {score}</Text>
                    <Text style={styles.timerText}>Temps: {timer}s</Text>
                </View>
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    <View style={styles.grid}>
                        {cards.map((card, index) => (
                            <Card key={index} 
                            card={card} 
                            onPress={() => handleCardPress(index)}  
                            cardSize={cardSize} />
                        ))}
                    </View>
                </ScrollView>
                {(showNextLevelButton || isGameOver) && (
                    <Animated.View
                        style={[
                            styles.buttonContainer,
                            {
                                opacity: buttonOpacity,
                                transform: [{ scale: buttonScale }],
                            },
                        ]}
                    >
                        <Button
                            mode="contained"
                            onPress={isGameOver ? resetGame : () => onLevelComplete(score)}
                            style={styles.button}
                            labelStyle={styles.buttonLabel}
                        >
                            {isGameOver ? "Recommencer" : "Niveau suivant"}
                        </Button>
                    </Animated.View>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: 10,
        paddingTop: 10,

   
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    scoreText: {
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'monospace',
        color: '#003366',
    },
    timerText: {
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'monospace',
        color: '#003366',
    },
    scrollViewContent: {
        paddingTop: 20,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        padding: 10,
    },
    buttonContainer: {
        width: '100%',
        paddingHorizontal: 20,
        paddingBottom: 20,
        alignItems: 'center',

    },
    button: {
        backgroundColor: '#6200ee',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 16,
        width: '100%',
    },
    buttonLabel: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'monospace',
    },
});

export default GameBoard;