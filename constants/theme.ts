import { StyleSheet } from 'react-native';

export const palette = {
	backgroundTop: '#667eea',
	backgroundBottom: '#764ba2',
	white: '#FFFFFF',
	black: '#000000',
	textDark: '#1F2937',
	muted: '#6B7280',
	primary: '#3B82F6',
	success: '#10B981',
	warning: '#F59E0B',
	glass: 'rgba(255,255,255,0.2)',
	glassSoft: 'rgba(255,255,255,0.1)'
};

export const spacing = {
	xs: 8,
	sm: 12,
	md: 16,
	lg: 20,
	xl: 24,
	xxl: 30
};

export const radius = {
	sm: 10,
	md: 12,
	lg: 15,
	xl: 20
};

export const shadow = {
	card: {
		elevation: 8,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8
	},
	soft: {
		elevation: 4,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8
	}
};

export const commonStyles = StyleSheet.create({
	container: {
		padding: spacing.lg,
		paddingTop: spacing.xxl
	},
	card: {
		backgroundColor: palette.white,
		borderRadius: radius.xl,
		padding: spacing.lg,
		...shadow.soft
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center'
	},
	spaceBetween: {
		justifyContent: 'space-between'
	},
	glass: {
		backgroundColor: palette.glass,
		borderRadius: radius.lg,
		padding: spacing.md
	},
	glassSoft: {
		backgroundColor: palette.glassSoft,
		borderRadius: radius.lg,
		padding: spacing.md
	},
	textTitle: {
		fontSize: 22,
		fontWeight: 'bold',
		color: palette.white
	},
	textMuted: {
		fontSize: 14,
		color: 'rgba(255,255,255,0.8)'
	},
	buttonPill: {
		borderRadius: radius.lg,
		padding: spacing.md,
		alignItems: 'center',
		flex: 1
	}
});


