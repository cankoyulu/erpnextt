import * as React from "react"
import { useNavigate } from "react-router"
import { LockIcon, ShieldCheckIcon, LogInIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FormField } from "@/components/pre-registration/FormField"
import { isValidTC } from "@/lib/tc-validate"
import { toast } from "sonner"

export default function Login() {
	const navigate = useNavigate()
	const [tcNo, setTcNo] = React.useState("")
	const [lastFive, setLastFive] = React.useState("")
	const [error, setError] = React.useState<string | null>(null)

	const handleTcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setTcNo(e.target.value.replace(/\D/g, "").slice(0, 11))
	}

	const handleLastFiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setLastFive(e.target.value.replace(/\D/g, "").slice(0, 5))
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)

		if (!/^\d{11}$/.test(tcNo)) {
			setError("T.C. Kimlik Numarası 11 haneli olmalıdır.")
			return
		}

		if (!isValidTC(tcNo)) {
			setError("Geçersiz T.C. Kimlik Numarası.")
			return
		}

		if (lastFive.length !== 5) {
			setError("T.C. Kimlik Numaranızın son 5 hanesini giriniz.")
			return
		}

		if (tcNo.slice(-5) !== lastFive) {
			setError("Girdiğiniz son 5 hane T.C. Kimlik Numaranız ile eşleşmiyor.")
			return
		}

		toast.success("Giriş başarılı! Panele yönlendiriliyorsunuz...")
		sessionStorage.setItem("tc_login", tcNo)
		navigate("/")
	}

	return (
		<div className="min-h-screen bg-surface-gray-1 flex items-center justify-center px-4 py-10">
			<div className="w-full max-w-md">
				<div className="mb-6 text-center">
					<div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-xl bg-surface-gray-3 text-ink-gray-7">
						<ShieldCheckIcon className="size-7" />
					</div>
					<h1 className="text-2xl font-bold text-ink-gray-8">
						Panel Girişi
					</h1>
					<p className="mt-1 text-p-base text-ink-gray-4">
						T.C. Kimlik Numaranız ve son 5 hanesi ile giriş yapınız.
					</p>
				</div>

				<Card className="shadow-lg">
					<CardContent>
						<form onSubmit={handleSubmit} className="flex flex-col gap-5">
							<FormField label="T.C. Kimlik Numarası" required>
								<div className="relative">
									<LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-gray-4" />
									<Input
										inputSize="lg"
										inputMode="numeric"
										placeholder="11 haneli kimlik numaranız"
										value={tcNo}
										onChange={handleTcChange}
										aria-invalid={!!error}
										className="pl-10"
									/>
								</div>
							</FormField>

							<FormField
								label="T.C. Kimlik No Son 5 Hanesi"
								required
								hint="Kimlik numaranızın son 5 hanesini giriniz"
							>
								<Input
									inputSize="lg"
									inputMode="numeric"
									placeholder="• • • • •"
									value={lastFive}
									onChange={handleLastFiveChange}
									aria-invalid={!!error}
								/>
							</FormField>

							{error && (
								<p className="text-p-sm text-ink-red-5 flex items-center gap-1.5">
									{error}
								</p>
							)}

							<Button
								type="submit"
								variant="solid"
								theme="gray"
								size="lg"
								className="w-full"
							>
								<LogInIcon className="size-4" />
								Giriş Yap
							</Button>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
