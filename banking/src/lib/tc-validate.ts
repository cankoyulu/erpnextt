/**
 * T.C. Kimlik Numarası validation algorithm.
 *
 * Rules:
 *  - 11 digits, first digit cannot be 0
 *  - 10th digit  = (sum of odd-position digits 1,3,5,7,9 × 7 − sum of even-position digits 2,4,6,8) mod 10
 *  - 11th digit = (sum of first 10 digits) mod 10
 */
export function isValidTC(tc: string): boolean {
	if (!/^\d{11}$/.test(tc)) return false
	if (tc[0] === "0") return false

	const digits = tc.split("").map(Number)

	const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8]
	const evenSum = digits[1] + digits[3] + digits[5] + digits[7]

	const tenth = (oddSum * 7 - evenSum) % 10
	if (tenth !== digits[9]) return false

	const eleventh = (oddSum + evenSum + digits[9]) % 10
	if (eleventh !== digits[10]) return false

	return true
}
