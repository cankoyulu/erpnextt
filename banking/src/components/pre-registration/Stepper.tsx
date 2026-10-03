import * as React from "react"
import { CheckIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface StepDef {
	id: number
	label: string
	icon: React.ReactNode
}

export function Stepper({
	steps,
	current,
	onStepClick,
	maxReached,
}: {
	steps: StepDef[]
	current: number
	onStepClick?: (step: number) => void
	maxReached: number
}) {
	return (
		<div className="w-full">
			{/* Desktop stepper */}
			<div className="hidden sm:flex items-center justify-between">
				{steps.map((step, idx) => {
					const isComplete = step.id < current
					const isActive = step.id === current
					const isReachable = step.id <= maxReached
					return (
						<React.Fragment key={step.id}>
							<button
								type="button"
								disabled={!isReachable}
								onClick={() => isReachable && onStepClick?.(step.id)}
								className={cn(
									"flex flex-col items-center gap-2 transition-all",
									isReachable ? "cursor-pointer" : "cursor-not-allowed",
								)}
							>
								<div
									className={cn(
										"flex size-10 items-center justify-center rounded-full border-2 transition-all",
										isComplete && "bg-ink-gray-8 border-ink-gray-8 text-ink-white",
										isActive && "border-ink-gray-8 bg-surface-white text-ink-gray-8 shadow-focus-gray",
										!isComplete && !isActive && "border-outline-gray-3 text-ink-gray-4",
									)}
								>
									{isComplete ? (
										<CheckIcon className="size-5" />
									) : (
										step.icon
									)}
								</div>
								<span
									className={cn(
										"text-sm font-medium whitespace-nowrap",
										isActive ? "text-ink-gray-8" : "text-ink-gray-4",
									)}
								>
									{step.label}
								</span>
							</button>
							{idx < steps.length - 1 && (
								<div
									className={cn(
										"h-0.5 flex-1 rounded-full transition-all",
										step.id < current ? "bg-ink-gray-8" : "bg-outline-gray-2",
									)}
								/>
							)}
						</React.Fragment>
					)
				})}
			</div>

			{/* Mobile progress bar */}
			<div className="sm:hidden">
				<div className="flex items-center justify-between mb-2">
					<span className="text-base font-medium text-ink-gray-7">
						Adım {current} / {steps.length}
					</span>
					<span className="text-sm text-ink-gray-4">
						{steps[current - 1]?.label}
					</span>
				</div>
				<div className="h-2 w-full rounded-full bg-surface-gray-2">
					<div
						className="h-2 rounded-full bg-ink-gray-8 transition-all"
						style={{ width: `${(current / steps.length) * 100}%` }}
					/>
				</div>
			</div>
		</div>
	)
}
