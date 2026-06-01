export const TOKENS = {
  depot: process.env.NEXT_PUBLIC_DEPOT_TOKEN!,
  galerie: process.env.NEXT_PUBLIC_GALERIE_TOKEN!,
} as const

export type TokenType = keyof typeof TOKENS

export function isValidToken(type: TokenType, token: string): boolean {
  return token === TOKENS[type]
}