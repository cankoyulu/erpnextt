import { lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { FrappeProvider } from 'frappe-react-sdk'
import { Toaster } from '@/components/ui/sonner'
import BankReconciliation from '@/pages/BankReconciliation'
import BankStatementImporterContainer from '@/pages/BankStatementImporterContainer'
import PreRegistration from '@/pages/PreRegistration'
import { TooltipProvider } from './components/ui/tooltip'
import { LucideProvider } from 'lucide-react'
import { ThemeProvider } from './components/ui/theme-provider'

const BankStatementImporter = lazy(() => import('@/pages/BankStatementImporter'))
const ViewBankStatementImportLog = lazy(() => import('@/pages/ViewBankStatementImportLog'))

const isLoggedIn = window.frappe?.boot?.user?.name && window.frappe?.boot?.user?.name !== 'Guest'

function App() {
	return (
		<LucideProvider
			strokeWidth={1.5}
		>
			<TooltipProvider>
				<FrappeProvider
					swrConfig={{
						errorRetryCount: 2
					}}
					socketPort={import.meta.env.VITE_SOCKET_PORT}
					siteName={window.frappe?.boot?.sitename ?? import.meta.env.VITE_SITE_NAME}>
					<ThemeProvider
						defaultTheme={window.frappe?.boot?.desk_theme ?? "Automatic"}
					>
						<BrowserRouter basename={import.meta.env.VITE_BASE_NAME ? `/${import.meta.env.VITE_BASE_NAME}` : ''}>
							<Routes>
								{/* Public route — accessible without login */}
								<Route path="/on-kayit" element={<PreRegistration />} />

								{/* Authenticated routes */}
								{isLoggedIn ? (
									<>
										<Route index element={<BankReconciliation />} />
										<Route path="/statement-importer" element={<BankStatementImporterContainer />}>
											<Route index element={<BankStatementImporter />} />
											<Route path=":id" element={<ViewBankStatementImportLog />} />
										</Route>
										<Route path="*" element={<Navigate to="/" />} />
									</>
								) : (
									<>
										<Route index element={<PreRegistration />} />
										<Route path="*" element={<PreRegistration />} />
									</>
								)}
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
