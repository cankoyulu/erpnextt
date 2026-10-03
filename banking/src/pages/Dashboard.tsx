import { UsersIcon, CalendarDaysIcon, PresentationIcon, SettingsIcon, FileTextIcon, BarChart3Icon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const menuItems = [
	{ icon: CalendarDaysIcon, title: "Kongreler", desc: "Kongre oluşturma ve yönetimi" },
	{ icon: UsersIcon, title: "Katılımcılar", desc: "Kayıt ve katılımcı takibi" },
	{ icon: PresentationIcon, title: "Konuşmacılar", desc: "Konuşmacı yönetimi" },
	{ icon: FileTextIcon, title: "Program", desc: "Oturum ve program planlama" },
	{ icon: BarChart3Icon, title: "Raporlar", desc: "Katılım ve istatistik raporları" },
	{ icon: SettingsIcon, title: "Ayarlar", desc: "Sistem ayarları" },
]

export default function Dashboard() {
	return (
		<div className="min-h-screen bg-surface-gray-1">
			<header className="border-b border-outline-gray-modals bg-surface-white px-6 py-4">
				<h1 className="text-2xl font-bold text-ink-gray-8">Kongre Yönetim Sistemi</h1>
				<p className="mt-1 text-p-base text-ink-gray-4">Kongre, katılımcı ve program yönetim paneli</p>
			</header>

			<main className="mx-auto max-w-6xl px-6 py-10">
				<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{menuItems.map((item) => (
						<Card key={item.title} className="hover:shadow-md transition-shadow cursor-pointer">
							<CardContent className="flex flex-col gap-3">
								<div className="flex size-11 items-center justify-center rounded-lg bg-surface-gray-3 text-ink-gray-7">
									<item.icon className="size-5" />
								</div>
								<div>
									<h2 className="text-lg font-semibold text-ink-gray-8">{item.title}</h2>
									<p className="mt-0.5 text-p-sm text-ink-gray-4">{item.desc}</p>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</main>
		</div>
	)
}
