export const TOKENS = {
  depot: process.env.DEPOT_TOKEN!,
  galerie: process.env.GALERIE_TOKEN!,
} as const

export type TokenType = keyof typeof TOKENS

export function isValidToken(type: TokenType, token: string): boolean {
  return token === TOKENS[type]
}