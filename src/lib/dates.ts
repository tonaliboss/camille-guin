export const WEDDING_DATE = new Date(process.env.NEXT_PUBLIC_WEDDING_DATE!)

export function formatDate(date: Date) {
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function getStorageExpiryDate() {
  const expiry = new Date(WEDDING_DATE)
  expiry.setFullYear(expiry.getFullYear() + 1)
  return formatDate(expiry)
}

export function getVideoDeliveryDate() {
  const delivery = new Date(WEDDING_DATE)
  delivery.setDate(delivery.getDate() + 2)
  return formatDate(delivery)
}