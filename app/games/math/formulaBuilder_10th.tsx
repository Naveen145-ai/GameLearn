import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { saveGameScore } from '../../../src/services/apiService';
import { saveLocalProgress } from '../../../src/db/gameService';

type FormulaPuzzle = {
	formulaId: string;
	display: string;
	slots: number;
	terms: string[];
	answer: string[];
};

const PUZZLES_10: FormulaPuzzle[] = [
	{
		formulaId: 'quadratic_formula',
		display: 'x =',
		slots: 1,
		terms: ['(-b ± √(b² - 4ac)) / (2a)', '(b² - 4ac) / (2a)', '(-b) / (2a)'],
		answer: ['(-b ± √(b² - 4ac)) / (2a)']
	},
	{
		formulaId: 'trig_identity',
		display: 'sin²θ + cos²θ =',
		slots: 1,
		terms: ['1', '0', 'sinθ cosθ'],
		answer: ['1']
	},
	{
		formulaId: 'arithmetic_progression_nth',
		display: 'aₙ =',
		slots: 1,
		terms: ['a + (n−1)d', 'a + nd', 'n(a + d)'],
		answer: ['a + (n−1)d']
	},
	{
		formulaId: 'surface_area_sphere',
		display: 'SA(sphere) =',
		slots: 1,
		terms: ['4πr²', '2πr²', 'πr²'],
		answer: ['4πr²']
	}
];

export default function FormulaBuilder10th() {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [placed, setPlaced] = useState<string[]>([]);
	const [score, setScore] = useState(0);
	const [mistakes, setMistakes] = useState(0);
	const puzzle = PUZZLES_10[currentIndex];
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
			setScore(s => s + 120);
			if (currentIndex < PUZZLES_10.length - 1) {
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
		try {
			saveLocalProgress({
				student_id: 'S_LOCAL',
				game_id: 'math_10th_formula_builder',
				score,
				time_spent: 0,
				level: currentIndex + 1,
				grade: 10,
				subject: 'Math',
				date: new Date().toISOString()
			});
			await saveGameScore({
				userId: `user_${Date.now()}`,
				gameId: 'math_10th_formula_builder',
				score: score,
				timeSpent: 0,
				completedAt: new Date().toISOString(),
				grade: 10,
				subject: 'Math'
			});
		} catch {}
		Alert.alert('Game Over', `Score: ${score}`, [
			{ text: 'OK', onPress: () => router.back() }
		]);
	};

	return (
		<LinearGradient colors={['#22C55E', '#065F46']} style={{ flex: 1 }}>
			<View style={{ flex: 1, paddingTop: 60, paddingHorizontal: 20 }}>
				{/* Header */}
				<Animatable.View animation="fadeInDown" style={{ alignItems: 'center', marginBottom: 20 }}>
					<Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>Formula Builder - 10th</Text>
					<Text style={{ color: 'rgba(255,255,255,0.8)', marginTop: 6 }}>Choose the correct formula</Text>
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


