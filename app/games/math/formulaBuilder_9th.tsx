import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../../src/contexts/AuthContext';
import { saveGameScore } from '../../../src/services/apiService';
import { saveLocalProgress } from '../../../src/db/gameService';

type FormulaPuzzle = {
	formulaId: string;
	display: string;
	slots: number;
	terms: string[];
	answer: string[];
};

const PUZZLES_9: FormulaPuzzle[] = [
	{
		formulaId: 'algebra_identity_1',
		display: '(a + b)² =',
		slots: 3,
		terms: ['a²', '2ab', 'b²', 'ab²', 'a³'],
		answer: ['a²', '2ab', 'b²']
	},
	{
		formulaId: 'algebra_identity_2',
		display: '(a − b)² =',
		slots: 3,
		terms: ['a²', '−2ab', 'b²', '2ab', 'a²b'],
		answer: ['a²', '−2ab', 'b²']
	},
	{
		formulaId: 'geometry_triangle_area',
		display: 'Area(Δ) =',
		slots: 1,
		terms: ['½ × b × h', '2πr', 'l × w'],
		answer: ['½ × b × h']
	},
	{
		formulaId: 'rectangle_perimeter',
		display: 'Perimeter(rect) =',
		slots: 1,
		terms: ['2(l + w)', 'l × w', 'πr²'],
		answer: ['2(l + w)']
	}
];

export default function FormulaBuilder9th() {
	const { user } = useAuth();
	const [currentIndex, setCurrentIndex] = useState(0);
	const [placed, setPlaced] = useState<string[]>([]);
	const [score, setScore] = useState(0);
	const [mistakes, setMistakes] = useState(0);
	const [startTime] = useState(Date.now());
	const puzzle = PUZZLES_9[currentIndex];
	const remainingTerms = useMemo(() => {
		return puzzle.terms.filter(t => !placed.includes(t) || placed.filter(p => p === t).length < puzzle.answer.filter(a => a === t).length);
	}, [puzzle, placed]);

	const resetPuzzle = () => setPlaced([]);

	const selectTerm = (term: string) => {
		if (placed.length >= puzzle.slots) return;
		const next = [...placed, term];
		setPlaced(next);
	};

	const undo = () => {
		if (!placed.length) return;
		const next = placed.slice(0, -1);
		setPlaced(next);
	};

	const checkAnswer = () => {
		if (placed.length !== puzzle.slots) return;
		const correct = placed.every((t, i) => t === puzzle.answer[i]);
		if (correct) {
			setScore(s => s + 100);
			if (currentIndex < PUZZLES_9.length - 1) {
				setTimeout(() => {
					setCurrentIndex(i => i + 1);
					setPlaced([]);
				}, 300);
			} else {
				endGame();
			}
		} else {
			setMistakes(m => m + 1);
		}
	};

	const endGame = async () => {
		const timeSpent = Math.floor((Date.now() - startTime) / 1000); // Time in seconds
		const finalScore = score - (mistakes * 10); // Deduct points for mistakes
		
		try {
			// Save to local database
			saveLocalProgress({
				student_id: user?.id || 'unknown',
				game_id: 'math_9th_formula_builder',
				score: finalScore,
				time_spent: timeSpent,
				level: currentIndex + 1,
				grade: user?.grade || 9,
				subject: 'Math',
				date: new Date().toISOString()
			});
			
			// Try to save to server
			await saveGameScore({
				userId: user?.id || 'unknown',
				gameId: 'math_9th_formula_builder',
				score: finalScore,
				timeSpent: timeSpent,
				completedAt: new Date().toISOString(),
				grade: user?.grade || 9,
				subject: 'Math'
			});
		} catch (error) {
			console.log('Server save failed, but local save succeeded');
		}
		
		Alert.alert('Game Over', `Final Score: ${finalScore}\nTime: ${timeSpent}s\nMistakes: ${mistakes}`, [
			{ text: 'OK', onPress: () => router.back() }
		]);
	};

	return (
		<LinearGradient colors={['#2563EB', '#1E3A8A']} style={{ flex: 1 }}>
			<View style={{ flex: 1, paddingTop: 60, paddingHorizontal: 20 }}>
				{/* Header */}
				<Animatable.View animation="fadeInDown" style={{ alignItems: 'center', marginBottom: 20 }}>
					<Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>Formula Builder - 9th</Text>
					<Text style={{ color: 'rgba(255,255,255,0.8)', marginTop: 6 }}>Build the formula by selecting terms</Text>
				</Animatable.View>

				{/* Score Row */}
				<View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
					<View style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 10 }}>
						<Text style={{ color: 'white', fontWeight: 'bold' }}>Score: {score}</Text>
					</View>
					<View style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 10 }}>
						<Text style={{ color: 'white' }}>Mistakes: {mistakes}</Text>
					</View>
					<TouchableOpacity onPress={endGame}>
						<Ionicons name="close-circle" size={28} color="white" />
					</TouchableOpacity>
				</View>

				{/* Puzzle Card */}
				<Animatable.View animation="fadeInUp" style={{ backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: 16, marginBottom: 16 }}>
					<Text style={{ color: 'white', fontSize: 18, marginBottom: 8 }}>{puzzle.display}</Text>
					<View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
						{Array.from({ length: puzzle.slots }).map((_, i) => (
							<View key={i} style={{ minWidth: 64, paddingVertical: 8, paddingHorizontal: 10, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 10, marginRight: 8, marginBottom: 8 }}>
								<Text style={{ color: 'white', fontWeight: 'bold' }}>{placed[i] || '...'}</Text>
							</View>
						))}
					</View>
					<View style={{ flexDirection: 'row', marginTop: 12 }}>
						<TouchableOpacity onPress={undo} style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, marginRight: 8 }}>
							<Text style={{ color: 'white' }}>Undo</Text>
						</TouchableOpacity>
						<TouchableOpacity onPress={resetPuzzle} style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10 }}>
							<Text style={{ color: 'white' }}>Reset</Text>
						</TouchableOpacity>
					</View>
				</Animatable.View>

				{/* Term Bank */}
				<Animatable.View animation="fadeInUp" delay={150} style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 16 }}>
					<Text style={{ color: 'white', opacity: 0.9, marginBottom: 8 }}>Choose terms</Text>
					<View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
						{remainingTerms.map((term, idx) => (
							<TouchableOpacity key={idx} onPress={() => selectTerm(term)} style={{ backgroundColor: 'rgba(255,255,255,0.18)', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, marginRight: 8, marginBottom: 8 }}>
								<Text style={{ color: 'white', fontWeight: 'bold' }}>{term}</Text>
							</TouchableOpacity>
						))}
					</View>
					<TouchableOpacity onPress={checkAnswer} disabled={placed.length !== puzzle.slots} style={{ marginTop: 12, backgroundColor: placed.length === puzzle.slots ? '#22C55E' : 'rgba(255,255,255,0.2)', paddingVertical: 12, borderRadius: 12, alignItems: 'center' }}>
						<Text style={{ color: 'white', fontWeight: 'bold' }}>{placed.length === puzzle.slots ? 'Check' : 'Select all terms'}</Text>
					</TouchableOpacity>
				</Animatable.View>
			</View>
		</LinearGradient>
	);
}


