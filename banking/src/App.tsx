import { BrowserRouter, Route, Routes } from 'react-router'
import { FrappeProvider } from 'frappe-react-sdk'
import { Toaster } from '@/components/ui/sonner'
import Dashboard from '@/pages/Dashboard'
import { TooltipProvider } from './components/ui/tooltip'
import { LucideProvider } from 'lucide-react'
import { ThemeProvider } from './components/ui/theme-provider'

function App() {
	return (
		<LucideProvider strokeWidth={1.5}>
			<TooltipProvider>
				<FrappeProvider
					swrConfig={{ errorRetryCount: 2 }}
					socketPort={import.meta.env.VITE_SOCKET_PORT}
					siteName={window.frappe?.boot?.sitename ?? import.meta.env.VITE_SITE_NAME}>
					<ThemeProvider defaultTheme={window.frappe?.boot?.desk_theme ?? "Automatic"}>
						<BrowserRouter basename={import.meta.env.VITE_BASE_NAME ? `/${import.meta.env.VITE_BASE_NAME}` : ''}>
							<Routes>
								<Route index element={<Dashboard />} />
								<Route path="*" element={<Dashboard />} />
							</Routes>
						</BrowserRouter>
						<Toaster richColors />
					</ThemeProvider>
				</FrappeProvider>
			</TooltipProvider>
		</LucideProvider>
	)
}

export default App
