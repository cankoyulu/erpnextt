import * as React from "react"
import { cn } from "@/lib/utils"

/** Etiket + alan + hata mesajı sarmalayıcı. */
export function FormField({
	label,
	required,
	error,
	children,
	className,
	hint,
}: {
	label: string
	required?: boolean
	error?: string
	children: React.ReactNode
	className?: string
	hint?: string
}) {
	return (
		<div className={cn("flex flex-col gap-1.5", className)}>
			<label className="text-base font-medium text-ink-gray-6">
				{label}
				{required && <span className="text-ink-red-5"> *</span>}
			</label>
			{children}
			{hint && !error && (
				<p className="text-p-xs text-ink-gray-4">{hint}</p>
			)}
			{error && (
				<p className="text-p-xs text-ink-red-5 flex items-center gap-1">
					{error}
				</p>
			)}
		</div>
	)
}
