import * as React from "react"
import { CheckIcon, ChevronDownIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"

interface ComboboxProps {
	options: string[]
	value: string
	onChange: (value: string) => void
	placeholder?: string
	searchPlaceholder?: string
	emptyText?: string
	disabled?: boolean
	allowFreeText?: boolean
	className?: string
}

/** Aranabilir combobox / autocomplete (Popover + cmdk). */
export function Combobox({
	options,
	value,
	onChange,
	placeholder = "Seçiniz...",
	searchPlaceholder = "Ara...",
	emptyText = "Sonuç bulunamadı.",
	disabled = false,
	allowFreeText = false,
	className,
}: ComboboxProps) {
	const [open, setOpen] = React.useState(false)
	const [search, setSearch] = React.useState("")

	React.useEffect(() => {
		if (!open) setSearch("")
	}, [open])

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					type="button"
					disabled={disabled}
					data-input-size="lg"
					className={cn(
						"flex w-full items-center justify-between gap-2 rounded-md border border-transparent bg-surface-gray-2 px-3 py-[11px] text-lg transition-all outline-none",
						"hover:bg-surface-gray-3 focus-visible:border-outline-gray-4 focus-visible:bg-surface-white focus-visible:shadow-focus-gray",
						"disabled:cursor-not-allowed disabled:bg-surface-gray-1 disabled:text-ink-gray-3 disabled:pointer-events-none",
						"value text-ink-gray-7",
						className,
					)}
				>
					<span className={cn("truncate text-left", !value && "text-ink-gray-4")}>
						{value || placeholder}
					</span>
					<ChevronDownIcon className="size-4 shrink-0 text-ink-gray-5" />
				</button>
			</PopoverTrigger>
			<PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
				<Command shouldFilter={true}>
					<CommandInput
						placeholder={searchPlaceholder}
						value={search}
						onValueChange={setSearch}
					/>
					<CommandList>
						<CommandEmpty>
							{allowFreeText && search.trim() ? (
								<button
									type="button"
									className="w-full px-2 py-1.5 text-base text-ink-blue-4 hover:bg-surface-gray-2 rounded text-left"
									onClick={() => {
										onChange(search.trim())
										setOpen(false)
									}}
								>
									"{search.trim()}" olarak kullan
								</button>
							) : (
								emptyText
							)}
						</CommandEmpty>
						<CommandGroup>
							{options.map((opt) => (
								<CommandItem
									key={opt}
									value={opt}
									onSelect={() => {
										onChange(opt)
										setOpen(false)
									}}
								>
									<CheckIcon
										className={cn(
											"size-4",
											value === opt ? "opacity-100" : "opacity-0",
										)}
									/>
									{opt}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	)
}
