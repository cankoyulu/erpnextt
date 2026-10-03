import * as React from "react"
import { ChevronDownIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command"
import { COUNTRY_CODES, type CountryCode } from "@/data/country-codes"
import { cn } from "@/lib/utils"

interface PhoneInputProps {
	countryCode: string
	onCountryCodeChange: (code: string) => void
	phone: string
	onPhoneChange: (phone: string) => void
	error?: string
}

/** (5XX) XXX XX XX formatına göre telefon maskesi uygular. */
export function maskPhone(raw: string): string {
	const digits = raw.replace(/\D/g, "").slice(0, 10)
	let out = ""
	if (digits.length > 0) out += "(" + digits.slice(0, 3)
	if (digits.length >= 3) out += ") "
	if (digits.length > 3) out += digits.slice(3, 6)
	if (digits.length > 6) out += " " + digits.slice(6, 8)
	if (digits.length > 8) out += " " + digits.slice(8, 10)
	return out
}

export function PhoneInput({
	countryCode,
	onCountryCodeChange,
	phone,
	onPhoneChange,
	error,
}: PhoneInputProps) {
	const [open, setOpen] = React.useState(false)
	const [search, setSearch] = React.useState("")

	React.useEffect(() => {
		if (!open) setSearch("")
	}, [open])

	const selected: CountryCode | undefined = COUNTRY_CODES.find(
		(c) => c.code === countryCode,
	)

	const filtered = COUNTRY_CODES.filter((c) =>
		`${c.label} ${c.code}`.toLowerCase().includes(search.toLowerCase()),
	)

	return (
		<div className="flex gap-2">
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<button
						type="button"
						data-input-size="lg"
						className={cn(
							"flex h-10 items-center gap-1.5 rounded-md border border-transparent bg-surface-gray-2 px-2.5 text-lg transition-all outline-none shrink-0",
							"hover:bg-surface-gray-3 focus-visible:border-outline-gray-4 focus-visible:bg-surface-white focus-visible:shadow-focus-gray",
						)}
					>
						<span className="text-xl leading-none">{selected?.flag ?? "🏳️"}</span>
						<span className="text-base text-ink-gray-7">{countryCode}</span>
						<ChevronDownIcon className="size-4 text-ink-gray-5" />
					</button>
				</PopoverTrigger>
				<PopoverContent className="p-0 w-64" align="start">
					<Command shouldFilter={false}>
						<CommandInput
							placeholder="Ülke ara..."
							value={search}
							onValueChange={setSearch}
						/>
						<CommandList>
							<CommandEmpty>Ülke bulunamadı.</CommandEmpty>
							<CommandGroup>
								{filtered.map((c) => (
									<CommandItem
										key={`${c.code}-${c.label}`}
										value={`${c.label} ${c.code}`}
										onSelect={() => {
											onCountryCodeChange(c.code)
											setOpen(false)
										}}
									>
										<span className="text-xl">{c.flag}</span>
										<span className="text-base">{c.label}</span>
										<span className="text-ink-gray-4 ms-auto text-sm">{c.code}</span>
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
			<input
				type="tel"
				inputMode="numeric"
				placeholder="(5XX) XXX XX XX"
				value={phone}
				onChange={(e) => onPhoneChange(maskPhone(e.target.value))}
				aria-invalid={!!error}
				className={cn(
					"flex h-10 w-full min-w-0 items-center rounded-md border border-transparent bg-surface-gray-2 px-3 text-lg outline-none transition-all",
					"hover:bg-surface-gray-3 focus-visible:border-outline-gray-4 focus-visible:bg-surface-white focus-visible:shadow-focus-gray",
					"placeholder:text-ink-gray-4 text-ink-gray-7",
					error &&
						"bg-surface-red-1 border-outline-red-3 shadow-focus-red",
				)}
			/>
		</div>
	)
}
