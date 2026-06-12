export const PREMIUM_FEATURES = ['menu', 'videoRecap', 'fontCustomization'] as const
export type PremiumFeature = typeof PREMIUM_FEATURES[number]

export const PLAN = (process.env.NEXT_PUBLIC_PLAN === 'premium' ? 'premium' : 'basic') as 'basic' | 'premium'

export function hasFeature(feature: PremiumFeature): boolean {
  return PLAN === 'premium'
}