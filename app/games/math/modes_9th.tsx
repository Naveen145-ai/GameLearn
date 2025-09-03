import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { router } from 'expo-router';

export default function MathModes9th() {
	const open = (screen: string) => router.push({ pathname: `/games/math/${screen}`, params: { grade: '9' } });

	return (
		<LinearGradient colors={['#F59E0B', '#D97706']} style={{ flex: 1 }}>
			<View style={{ flex: 1, paddingTop: 60, paddingHorizontal: 20 }}>
				<Animatable.View animation="fadeInDown" style={{ alignItems: 'center', marginBottom: 24 }}>
					<Text style={{ fontSize: 28, fontWeight: 'bold', color: 'white' }}>Math Modes - 9th</Text>
					<Text style={{ color: 'rgba(255,255,255,0.85)', marginTop: 6 }}>Pick a way to learn formulas</Text>
				</Animatable.View>

				{[
					{ title: 'Formula Builder', screen: 'formulaBuilder_9th' },
					{ title: 'Formula Runner', screen: 'runner' },
					{ title: 'Puzzle Blocks', screen: 'blocks' },
					{ title: 'Formula Maze', screen: 'maze' },
					{ title: 'Formula Shooter', screen: 'shooter' }
				].map((m, i) => (
					<Animatable.View key={m.title} animation="fadeInUp" delay={i * 120} style={{ marginBottom: 12 }}>
						<TouchableOpacity onPress={() => (m.screen === 'formulaBuilder_9th' ? router.push('/games/math/formulaBuilder_9th') : open(m.screen))} style={{ backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 14, padding: 16 }}>
							<Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>{m.title}</Text>
							<Text style={{ color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>Play and learn formulas</Text>
						</TouchableOpacity>
					</Animatable.View>
				))}
			</View>
		</LinearGradient>
	);
}


