import * as React from "react"
import { useForm } from "react-hook-form"
import {
	UserIcon,
	MailIcon,
	GraduationCapIcon,
	CameraIcon,
	CheckIcon,
	UploadCloudIcon,
	Trash2Icon,
	ArrowLeftIcon,
	ArrowRightIcon,
	PartyPopperIcon,
	ChevronDownIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { useDropzone } from "react-dropzone"
import { toast } from "sonner"

import { Stepper, type StepDef } from "@/components/pre-registration/Stepper"
import { FormField } from "@/components/pre-registration/FormField"
import { Combobox } from "@/components/pre-registration/Combobox"
import { PhoneInput, maskPhone } from "@/components/pre-registration/PhoneInput"
import { PROVINCES, getDistricts } from "@/data/turkey"
import { UNIVERSITIES, HIGH_SCHOOL_CATEGORIES } from "@/data/universities"
import { isValidTC } from "@/lib/tc-validate"
import { cn } from "@/lib/utils"

interface FormData {
	tcKimlik: string
	ad: string
	soyad: string
	cinsiyet: string
	dogumTarihi: string
	dogumYeri: string
	eposta: string
	telefonUlkeKodu: string
	telefon: string
	ikametgahIli: string
	ikametgahIlcesi: string
	egitimDuzeyi: string
	egitimIli: string
	egitimIlcesi: string
	egitimKurumu: string
	girisYili: string
	kvkk: boolean
}

const STEPS: StepDef[] = [
	{ id: 1, label: "Kişisel Bilgiler", icon: <UserIcon className="size-5" /> },
	{ id: 2, label: "İletişim & Adres", icon: <MailIcon className="size-5" /> },
	{ id: 3, label: "Eğitim Bilgileri", icon: <GraduationCapIcon className="size-5" /> },
	{ id: 4, label: "Fotoğraf & Onay", icon: <CameraIcon className="size-5" /> },
]

const STEP_FIELDS: Record<number, (keyof FormData)[]> = {
	1: ["tcKimlik", "ad", "soyad", "cinsiyet", "dogumTarihi", "dogumYeri"],
	2: ["eposta", "telefonUlkeKodu", "telefon", "ikametgahIli", "ikametgahIlcesi"],
	3: ["egitimDuzeyi", "egitimIli", "egitimIlcesi", "egitimKurumu", "girisYili"],
	4: ["kvkk"],
}

const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 80 }, (_, i) => currentYear - i)

export default function PreRegistration() {
	const [step, setStep] = React.useState(1)
	const [maxReached, setMaxReached] = React.useState(1)
	const [photo, setPhoto] = React.useState<File | null>(null)
	const [photoPreview, setPhotoPreview] = React.useState<string | null>(null)
	const [submitted, setSubmitted] = React.useState(false)

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		trigger,
		getValues,
		formState: { errors },
	} = useForm<FormData>({
		defaultValues: {
			telefonUlkeKodu: "+90",
			cinsiyet: "",
			dogumYeri: "",
			ikametgahIli: "",
			ikametgahIlcesi: "",
			egitimDuzeyi: "",
			egitimIli: "",
			egitimIlcesi: "",
			egitimKurumu: "",
			kvkk: false,
		},
		mode: "onTouched",
	})

	const watched = watch()

	// --- Photo dropzone ---
	const onDrop = React.useCallback(
		(accepted: File[]) => {
			const file = accepted[0]
			if (!file) return
			if (file.size > 5 * 1024 * 1024) {
				toast.error("Dosya boyutu 5 MB'ı geçemez.")
				return
			}
			setPhoto(file)
			setPhotoPreview(URL.createObjectURL(file))
		},
		[],
	)
	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			"image/jpeg": [".jpg", ".jpeg"],
			"image/png": [".png"],
		},
		maxFiles: 1,
	})

	const removePhoto = () => {
		setPhoto(null)
		if (photoPreview) URL.revokeObjectURL(photoPreview)
		setPhotoPreview(null)
	}

	// --- Navigation ---
	const goNext = async () => {
		const valid = await trigger(STEP_FIELDS[step])
		if (!valid) return
		if (step === 4) {
			handleSubmit(onSubmit)()
			return
		}
		setStep((s) => s + 1)
		setMaxReached((m) => Math.max(m, step + 1))
	}

	const goBack = () => {
		if (step > 1) setStep((s) => s - 1)
	}

	const goToStep = (target: number) => {
		if (target <= maxReached) setStep(target)
	}

	const onSubmit = (data: FormData) => {
		if (!photo) {
			toast.error("Lütfen vesikalık fotoğraf yükleyiniz.")
			return
		}
		setSubmitted(true)
		toast.success("Ön kaydınız başarıyla alınmıştır!")
	}

	// --- Dynamic district resets ---
	const dogumYeri = watched.dogumYeri
	const ikametgahIli = watched.ikametgahIli
	const egitimIli = watched.egitimIli
	const egitimDuzeyi = watched.egitimDuzeyi

	if (submitted) return <SuccessScreen data={getValues()} photo={photo} />

	return (
		<div className="min-h-screen bg-surface-gray-1 py-6 px-4 sm:py-10">
			<div className="mx-auto max-w-3xl">
				{/* Header */}
				<div className="mb-6 text-center">
					<h1 className="text-2xl font-bold text-ink-gray-8">
						Ön Kayıt ve Başvuru Formu
					</h1>
					<p className="mt-1 text-p-base text-ink-gray-4">
						Başvurunuzu tamamlamak için lütfen aşağıdaki adımları takip ediniz.
					</p>
				</div>

				{/* Stepper */}
				<div className="mb-6">
					<Stepper
						steps={STEPS}
						current={step}
						maxReached={maxReached}
						onStepClick={goToStep}
					/>
				</div>

				<Card className="shadow-lg">
					<CardHeader>
						<CardTitle className="text-xl">
							{STEPS[step - 1].label}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-5">
							{step === 1 && (
								<Step1Personal
									register={register}
									errors={errors}
									watched={watched}
									setValue={setValue}
									dogumYeri={dogumYeri}
								/>
							)}
							{step === 2 && (
								<Step2Contact
									register={register}
									errors={errors}
									watched={watched}
									setValue={setValue}
									ikametgahIli={ikametgahIli}
								/>
							)}
							{step === 3 && (
								<Step3Education
									register={register}
									errors={errors}
									watched={watched}
									setValue={setValue}
									egitimIli={egitimIli}
									egitimDuzeyi={egitimDuzeyi}
								/>
							)}
							{step === 4 && (
								<Step4Photo
									photo={photo}
									photoPreview={photoPreview}
									getRootProps={getRootProps}
									getInputProps={getInputProps}
									isDragActive={isDragActive}
									removePhoto={removePhoto}
									watched={watched}
									register={register}
									errors={errors}
									setValue={setValue}
								/>
							)}

							{/* Navigation */}
							<div className="flex items-center justify-between gap-3 pt-2 border-t border-outline-gray-2">
								<Button
									type="button"
									variant="outline"
									theme="gray"
									size="lg"
									onClick={goBack}
									disabled={step === 1}
									className={cn(step === 1 && "invisible")}
								>
									<ArrowLeftIcon className="size-4" />
									Geri
								</Button>
								<Button
									type="button"
									variant="solid"
									theme="gray"
									size="lg"
									onClick={goNext}
								>
									{step === 4 ? (
										<>
											Başvuruyu Gönder
											<ArrowRightIcon className="size-4" />
										</>
									) : (
										<>
											İleri
											<ArrowRightIcon className="size-4" />
										</>
									)}
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}

/* ============ STEP 1: KİŞİSEL BİLGİLER ============ */
function Step1Personal({
	register,
	errors,
	watched,
	setValue,
	dogumYeri,
}: {
	register: ReturnType<typeof useForm<FormData>>["register"]
	errors: ReturnType<typeof useForm<FormData>>["formState"]["errors"]
	watched: FormData
	setValue: ReturnType<typeof useForm<FormData>>["setValue"]
	dogumYeri: string
}) {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
			<FormField
				label="T.C. Kimlik Numarası"
				required
				error={errors.tcKimlik?.message}
				className="sm:col-span-2"
			>
				<Input
					inputSize="lg"
					placeholder="11 haneli kimlik numaranız"
					aria-invalid={!!errors.tcKimlik}
					{...register("tcKimlik", {
						required: "T.C. Kimlik No zorunludur.",
						validate: (v) => {
							if (!/^\d{11}$/.test(v)) return "11 haneli rakam giriniz."
							if (!isValidTC(v)) return "Geçersiz T.C. Kimlik Numarası."
							return true
						},
						onChange: (e) => {
							e.target.value = e.target.value.replace(/\D/g, "").slice(0, 11)
						},
					})}
				/>
			</FormField>

			<FormField label="Ad" required error={errors.ad?.message}>
				<Input
					inputSize="lg"
					placeholder="Adınız"
					aria-invalid={!!errors.ad}
					{...register("ad", {
						required: "Ad zorunludur.",
						minLength: { value: 2, message: "En az 2 karakter giriniz." },
					})}
				/>
			</FormField>

			<FormField label="Soyad" required error={errors.soyad?.message}>
				<Input
					inputSize="lg"
					placeholder="Soyadınız"
					aria-invalid={!!errors.soyad}
					{...register("soyad", {
						required: "Soyad zorunludur.",
						minLength: { value: 2, message: "En az 2 karakter giriniz." },
					})}
				/>
			</FormField>

			<FormField label="Cinsiyet" required error={errors.cinsiyet?.message}>
				<RadioGroup
					value={watched.cinsiyet}
					onValueChange={(v) => setValue("cinsiyet", v, { shouldValidate: true })}
					className="flex flex-row gap-4 pt-1"
				>
					{["Erkek", "Kadın", "Belirtmek İstemiyorum"].map((g) => (
						<div key={g} className="flex items-center gap-2">
							<RadioGroupItem id={`gender-${g}`} value={g} />
							<Label htmlFor={`gender-${g}`}>{g}</Label>
						</div>
					))}
				</RadioGroup>
			</FormField>

			<FormField
				label="Doğum Tarihi"
				required
				error={errors.dogumTarihi?.message}
			>
				<Input
					type="date"
					inputSize="lg"
					aria-invalid={!!errors.dogumTarihi}
					{...register("dogumTarihi", {
						required: "Doğum tarihi zorunludur.",
						validate: (v) => {
							const d = new Date(v)
							return (
								(d < new Date() && d > new Date("1900-01-01")) ||
								"Geçerli bir tarih giriniz."
							)
						},
					})}
				/>
			</FormField>

			<FormField
				label="Doğum Yeri"
				required
				error={errors.dogumYeri?.message}
				className="sm:col-span-2"
			>
				<Select
					value={watched.dogumYeri}
					onValueChange={(v) => setValue("dogumYeri", v, { shouldValidate: true })}
				>
					<SelectTrigger inputSize="lg" className="w-full">
						<SelectValue placeholder="İl seçiniz" />
					</SelectTrigger>
					<SelectContent>
						{PROVINCES.map((p) => (
							<SelectItem key={p} value={p}>
								{p}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</FormField>
		</div>
	)
}

/* ============ STEP 2: İLETİŞİM & ADRES ============ */
function Step2Contact({
	register,
	errors,
	watched,
	setValue,
	ikametgahIli,
}: {
	register: ReturnType<typeof useForm<FormData>>["register"]
	errors: ReturnType<typeof useForm<FormData>>["formState"]["errors"]
	watched: FormData
	setValue: ReturnType<typeof useForm<FormData>>["setValue"]
	ikametgahIli: string
}) {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
			<FormField
				label="E-posta Adresi"
				required
				error={errors.eposta?.message}
				className="sm:col-span-2"
			>
				<Input
					type="email"
					inputSize="lg"
					placeholder="ornek@domain.com"
					aria-invalid={!!errors.eposta}
					{...register("eposta", {
						required: "E-posta zorunludur.",
						pattern: {
							value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
							message: "Geçerli bir e-posta giriniz.",
						},
					})}
				/>
			</FormField>

			<FormField
				label="Telefon Numarası"
				required
				error={errors.telefon?.message}
				className="sm:col-span-2"
			>
				<PhoneInput
					countryCode={watched.telefonUlkeKodu}
					onCountryCodeChange={(code) => setValue("telefonUlkeKodu", code)}
					phone={watched.telefon}
					onPhoneChange={(phone) => setValue("telefon", phone, { shouldValidate: true })}
					error={errors.telefon?.message}
				/>
				<input
					type="hidden"
					{...register("telefon", {
						required: "Telefon zorunludur.",
						validate: (v) =>
							v.replace(/\D/g, "").length === 10 ||
							"10 haneli telefon numarası giriniz.",
					})}
				/>
			</FormField>

			<FormField
				label="İkametgah İli"
				required
				error={errors.ikametgahIli?.message}
			>
				<Select
					value={watched.ikametgahIli}
					onValueChange={(v) => {
						setValue("ikametgahIli", v, { shouldValidate: true })
						setValue("ikametgahIlcesi", "")
					}}
				>
					<SelectTrigger inputSize="lg" className="w-full">
						<SelectValue placeholder="İl seçiniz" />
					</SelectTrigger>
					<SelectContent>
						{PROVINCES.map((p) => (
							<SelectItem key={p} value={p}>
								{p}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</FormField>

			<FormField
				label="İkametgah İlçesi"
				required
				error={errors.ikametgahIlcesi?.message}
				hint={
					!ikametgahIli ? "Önce il seçiniz" : undefined
				}
			>
				<Select
					value={watched.ikametgahIlcesi}
					onValueChange={(v) =>
						setValue("ikametgahIlcesi", v, { shouldValidate: true })
					}
					disabled={!ikametgahIli}
				>
					<SelectTrigger inputSize="lg" className="w-full">
						<SelectValue
							placeholder={ikametgahIli ? "İlçe seçiniz" : "Önce il seçiniz"}
						/>
					</SelectTrigger>
					<SelectContent>
						{getDistricts(ikametgahIli).map((d) => (
							<SelectItem key={d} value={d}>
								{d}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</FormField>
		</div>
	)
}

/* ============ STEP 3: EĞİTİM BİLGİLERİ ============ */
function Step3Education({
	register,
	errors,
	watched,
	setValue,
	egitimIli,
	egitimDuzeyi,
}: {
	register: ReturnType<typeof useForm<FormData>>["register"]
	errors: ReturnType<typeof useForm<FormData>>["formState"]["errors"]
	watched: FormData
	setValue: ReturnType<typeof useForm<FormData>>["setValue"]
	egitimIli: string
	egitimDuzeyi: string
}) {
	const isUniversity = egitimDuzeyi === "Üniversite"

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
			<FormField
				label="Eğitim Düzeyi"
				required
				error={errors.egitimDuzeyi?.message}
			>
				<Select
					value={watched.egitimDuzeyi}
					onValueChange={(v) => {
						setValue("egitimDuzeyi", v, { shouldValidate: true })
						setValue("egitimKurumu", "")
					}}
				>
					<SelectTrigger inputSize="lg" className="w-full">
						<SelectValue placeholder="Seçiniz" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="Lise">Lise</SelectItem>
						<SelectItem value="Üniversite">Üniversite</SelectItem>
					</SelectContent>
				</Select>
			</FormField>

			<FormField
				label="Eğitim Kurumuna Giriş Yılı"
				required
				error={errors.girisYili?.message}
			>
				<Select
					value={watched.girisYili}
					onValueChange={(v) => setValue("girisYili", v, { shouldValidate: true })}
				>
					<SelectTrigger inputSize="lg" className="w-full">
						<SelectValue placeholder="Yıl seçiniz" />
					</SelectTrigger>
					<SelectContent>
						{YEARS.map((y) => (
							<SelectItem key={y} value={String(y)}>
								{y}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</FormField>

			<FormField
				label="Okuduğu / Mezun Olduğu İl"
				required
				error={errors.egitimIli?.message}
			>
				<Select
					value={watched.egitimIli}
					onValueChange={(v) => {
						setValue("egitimIli", v, { shouldValidate: true })
						setValue("egitimIlcesi", "")
					}}
				>
					<SelectTrigger inputSize="lg" className="w-full">
						<SelectValue placeholder="İl seçiniz" />
					</SelectTrigger>
					<SelectContent>
						{PROVINCES.map((p) => (
							<SelectItem key={p} value={p}>
								{p}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</FormField>

			<FormField
				label="Okuduğu / Mezun Olduğu İlçe"
				required
				error={errors.egitimIlcesi?.message}
				hint={!egitimIli ? "Önce il seçiniz" : undefined}
			>
				<Select
					value={watched.egitimIlcesi}
					onValueChange={(v) => setValue("egitimIlcesi", v, { shouldValidate: true })}
					disabled={!egitimIli}
				>
					<SelectTrigger inputSize="lg" className="w-full">
						<SelectValue
							placeholder={egitimIli ? "İlçe seçiniz" : "Önce il seçiniz"}
						/>
					</SelectTrigger>
					<SelectContent>
						{getDistricts(egitimIli).map((d) => (
							<SelectItem key={d} value={d}>
								{d}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</FormField>

			<FormField
				label="Eğitim Kurumu"
				required
				error={errors.egitimKurumu?.message}
				className="sm:col-span-2"
				hint={
					!egitimDuzeyi
						? "Önce eğitim düzeyi seçiniz"
						: isUniversity
							? "Universite araması yapabilirsiniz"
							: "Listeden seçebilir veya serbest metin girebilirsiniz"
				}
			>
				{egitimDuzeyi ? (
					<Combobox
						options={isUniversity ? UNIVERSITIES : HIGH_SCHOOL_CATEGORIES}
						value={watched.egitimKurumu}
						onChange={(v) => setValue("egitimKurumu", v, { shouldValidate: true })}
						placeholder={
							isUniversity ? "Üniversite arayın..." : "Lise türü seçin veya yazın..."
						}
						searchPlaceholder="Ara..."
						allowFreeText={!isUniversity}
					/>
				) : (
					<Input
						inputSize="lg"
						disabled
						placeholder="Önce eğitim düzeyi seçiniz"
					/>
				)}
				<input
					type="hidden"
					{...register("egitimKurumu", {
						required: "Eğitim kurumu zorunludur.",
					})}
				/>
			</FormField>
		</div>
	)
}

/* ============ STEP 4: FOTOĞRAF & ONAY ============ */
function Step4Photo({
	photo,
	photoPreview,
	getRootProps,
	getInputProps,
	isDragActive,
	removePhoto,
	watched,
	register,
	errors,
	setValue,
}: {
	photo: File | null
	photoPreview: string | null
	getRootProps: ReturnType<typeof useDropzone>["getRootProps"]
	getInputProps: ReturnType<typeof useDropzone>["getInputProps"]
	isDragActive: boolean
	removePhoto: () => void
	watched: FormData
	register: ReturnType<typeof useForm<FormData>>["register"]
	errors: ReturnType<typeof useForm<FormData>>["formState"]["errors"]
	setValue: ReturnType<typeof useForm<FormData>>["setValue"]
}) {
	return (
		<div className="flex flex-col gap-6">
			{/* Photo upload */}
			<FormField label="Vesikalık Fotoğraf" required>
				{photoPreview ? (
					<div className="flex items-center gap-4">
						<img
							src={photoPreview}
							alt="Önizleme"
							className="size-28 rounded-lg border border-outline-gray-2 object-cover"
						/>
						<div className="flex flex-col gap-2">
							{photo && (
								<span className="text-sm text-ink-gray-5">{photo.name}</span>
							)}
							<Button
								type="button"
								variant="subtle"
								theme="red"
								size="sm"
								onClick={removePhoto}
							>
								<Trash2Icon className="size-4" />
								Fotoğrafı Sil
							</Button>
						</div>
					</div>
				) : (
					<div
						{...getRootProps()}
						className={cn(
							"flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center cursor-pointer transition-all",
							isDragActive
								? "border-ink-gray-6 bg-surface-gray-3"
								: "border-outline-gray-3 bg-surface-gray-1 hover:bg-surface-gray-2 hover:border-outline-gray-4",
						)}
					>
						<input {...getInputProps()} />
						<UploadCloudIcon className="size-10 text-ink-gray-4" />
						<p className="text-base text-ink-gray-6">
							Sürükleyip bırakın veya tıklayarak seçin
						</p>
						<p className="text-p-xs text-ink-gray-4">
							.jpg, .jpeg, .png · Maksimum 5 MB
						</p>
					</div>
				)}
			</FormField>

			{/* Summary */}
			<div>
				<h3 className="text-lg font-semibold text-ink-gray-7 mb-3">
					Ön Kayıt Özeti
				</h3>
				<SummaryCard data={watched} />
			</div>

			{/* KVKK Consent */}
			<div className="rounded-lg border border-outline-gray-2 bg-surface-gray-1 p-4">
				<label className="flex items-start gap-3 cursor-pointer">
					<Checkbox
						checked={watched.kvkk}
						onCheckedChange={(v) =>
							setValue("kvkk", v === true, { shouldValidate: true })
						}
						aria-invalid={!!errors.kvkk}
					/>
					<span className="text-p-sm text-ink-gray-6">
						KVKK Aydınlatma Metni'ni okudum, kişisel verilerimin işlenmesine
						ve açık rızam vermiş bulunuyorum.{" "}
						<span className="text-ink-red-5">*</span>
					</span>
				</label>
				{errors.kvkk?.message && (
					<p className="text-p-xs text-ink-red-5 mt-2">
						{errors.kvkk.message}
					</p>
				)}
				<input
					type="hidden"
					{...register("kvkk", {
						required: "KVKK onayı zorunludur.",
					})}
				/>
			</div>
		</div>
	)
}

/* ============ SUMMARY CARD ============ */
function SummaryCard({ data }: { data: FormData }) {
	const rows: { label: string; value: string }[] = [
		{ label: "T.C. Kimlik No", value: data.tcKimlik },
		{ label: "Ad Soyad", value: `${data.ad} ${data.soyad}` },
		{ label: "Cinsiyet", value: data.cinsiyet },
		{ label: "Doğum Tarihi", value: data.dogumTarihi },
		{ label: "Doğum Yeri", value: data.dogumYeri },
		{ label: "E-posta", value: data.eposta },
		{ label: "Telefon", value: `${data.telefonUlkeKodu} ${data.telefon}` },
		{ label: "İkametgah", value: `${data.ikametgahIli} / ${data.ikametgahIlcesi}` },
		{ label: "Eğitim Düzeyi", value: data.egitimDuzeyi },
		{ label: "Eğitim Yeri", value: `${data.egitimIli} / ${data.egitimIlcesi}` },
		{ label: "Eğitim Kurumu", value: data.egitimKurumu },
		{ label: "Giriş Yılı", value: data.girisYili },
	]
	return (
		<div className="rounded-lg border border-outline-gray-2 overflow-hidden">
			<dl className="divide-y divide-outline-gray-1">
				{rows.map((row) => (
					<div
						key={row.label}
						className="flex items-start justify-between gap-4 px-4 py-2.5"
					>
						<dt className="text-sm text-ink-gray-4 shrink-0">{row.label}</dt>
						<dd className="text-sm text-ink-gray-7 text-right">
							{row.value || "—"}
						</dd>
					</div>
				))}
			</dl>
		</div>
	)
}

/* ============ SUCCESS SCREEN ============ */
function SuccessScreen({ data, photo }: { data: FormData; photo: File | null }) {
	return (
		<div className="min-h-screen bg-surface-gray-1 flex items-center justify-center px-4 py-10">
			<Card className="max-w-md w-full text-center shadow-lg">
				<CardContent className="flex flex-col items-center gap-4">
					<div className="flex size-16 items-center justify-center rounded-full bg-surface-green-2 text-ink-green-5">
						<PartyPopperIcon className="size-8" />
					</div>
					<h2 className="text-2xl font-bold text-ink-gray-8">
						Başvurunuz Alındı!
					</h2>
					<p className="text-p-base text-ink-gray-5">
						Sayın {data.ad} {data.soyad}, ön kayıt başvurunuz başarıyla
						tamamlanmıştır. Belirttiğiniz e-posta adresine ({data.eposta})
						onay mesajı gönderilmiştir.
					</p>
					{photo && (
						<img
							src={URL.createObjectURL(photo)}
							alt="Yüklenen fotoğraf"
							className="size-32 rounded-lg border border-outline-gray-2 object-cover"
						/>
					)}
					<div className="w-full rounded-lg border border-outline-gray-2 p-3 mt-2 text-left">
						<dl className="grid grid-cols-2 gap-y-2 gap-x-4">
							<dt className="text-sm text-ink-gray-4">Başvuru No</dt>
							<dd className="text-sm font-medium text-ink-gray-7">
								ÖN-{Date.now().toString().slice(-8)}
							</dd>
							<dt className="text-sm text-ink-gray-4">Tarih</dt>
							<dd className="text-sm font-medium text-ink-gray-7">
								{new Date().toLocaleDateString("tr-TR")}
							</dd>
						</dl>
					</div>
					<Button
						variant="outline"
						theme="gray"
						size="lg"
						onClick={() => window.location.reload()}
					>
						Yeni Başvuru
					</Button>
				</CardContent>
			</Card>
		</div>
	)
}
