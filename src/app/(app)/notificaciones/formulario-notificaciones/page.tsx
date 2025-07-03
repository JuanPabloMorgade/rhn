'use client';

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DialogClose } from '@/components/ui/dialog';
import { useNotificacion } from '@/contexts/notificacionContext';
import {
	formularioNotificaciones,
	opcionesCampoFeriados,
	opcionesCampoPersonal,
	opcionesDisparador,
	opcionesEnviarA,
	opcionesOrigen,
	opcionesPeriodicidad,
	opcionesRelacion,
} from '@/helpers/enum';
import { NotificacionData } from '@/interfaces/notificacion';
import { db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/authContext';
import { DayGridDropdown } from '@/components/custom/day-grid-dropdown';
import { MonthGridDropdown } from '@/components/custom/month-grid-dropdown';
import { useCorreos } from '@/contexts/correosDistribucionContext';
import { usePersonal } from '@/contexts/personalContext';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { fromISOToDDMMYYYY, toISO } from '@/helpers/helpers';

export default function NotificationsForm({
	onSuccess,
	notificacionExistente,
}: {
	onSuccess?: () => void;
	notificacionExistente?: NotificacionData | null;
}) {
	const {
		register,
		handleSubmit,
		control,
		watch,
		reset,
		resetField,
		setValue,
		formState: { errors, isSubmitting },
	} = useForm<NotificacionData>({ defaultValues: formularioNotificaciones });
	const {
		opcionesTemplates,
		crearNotificacion,
		editarNotificacion,
		obtenerTiposYTemplates,
		obtenerTipoDePlantilla,
	} = useNotificacion();
	const { correos, cargarCorreos } = useCorreos();
	const { user } = useAuth();
	const { personalesData, cargaPersonalPaginado } = usePersonal();
	const personal = personalesData?.personal || [];

	const [templateOptions, setTemplateOptions] = useState<
		{ value: string; label: string }[]
	>([]);
	const [disparadorOptions, setDisparadorOptions] = useState<
		{ value: string; label: string }[]
	>([]);
	const [distributionOptions, setDistributionOptions] = useState<
		{ value: string; label: string }[]
	>([]);
	const plantilla = watch('plantilla');
	const periodicidad = watch('periodicidad');
	const disparador = watch('disparadorEvento');
	const enviarA = watch('enviarA');
	const today = new Date().toISOString().split('T')[0];
	const [eventCounts, setEventCounts] = useState<Record<string, number>>({});

	const [origenDetectado, setOrigenDetectado] = useState(false);
	const [tiposPlantilla, setTiposPlantilla] = useState<string[]>([]);
	const [plantillasFiltradas, setPlantillasFiltradas] = useState<
		{ value: string; label: string }[]
	>([]);
	const [tipoSeleccionado, setTipoSeleccionado] = useState('');

	const tipoDestino = watch('tipoDestino');
	const relacionSeleccionada = watch('relacionDestino');
	const tipoSeleccionCorreoInstitucional = watch(
		'tipoSeleccionCorreoInstitucional'
	);
	const origen = watch('origen');
	const opcionesCampoActual =
		origen === 'feriados' ? opcionesCampoFeriados : opcionesCampoPersonal;

	useEffect(() => {
		opcionesTemplates().then(setTemplateOptions);
	}, [opcionesTemplates]);

	useEffect(() => {
		cargarCorreos();
	}, []);

	useEffect(() => {
		if (!notificacionExistente) return;

		const inicializarFormulario = async () => {
			const data = await obtenerTiposYTemplates();
			setTiposPlantilla(data.tipos);

			const tipo = await obtenerTipoDePlantilla(
				notificacionExistente.plantilla
			);
			if (tipo && data.tipos.includes(tipo)) {
				setTipoSeleccionado(tipo);
				const match = data.agrupado.find((g) => g.tipo === tipo);
				setPlantillasFiltradas(match?.templates || []);
			} else {
				// fallback para Todos
				setTipoSeleccionado('Todos');
				const todas = data.agrupado.flatMap((g) => g.templates);
				setPlantillasFiltradas(todas);
			}

			// enviarA
			let enviarA: string[] = [];

			if (notificacionExistente.tipoDestino === 'Correo de distribución') {
				enviarA = Array.isArray(notificacionExistente.enviarA)
					? notificacionExistente.enviarA
					: [notificacionExistente.enviarA].filter(Boolean);
			} else if (Array.isArray(notificacionExistente.enviarA)) {
				enviarA = notificacionExistente.enviarA;
			}

			reset({
				...notificacionExistente,
				enviarA,
				fecha1: fromISOToDDMMYYYY(notificacionExistente.fecha1),
				fecha2: fromISOToDDMMYYYY(notificacionExistente.fecha2),
			});
		};

		inicializarFormulario();
	}, [notificacionExistente, reset]);

	useEffect(() => {
		resetField('disparadorEvento');
		if (periodicidad === 'Anual' || periodicidad === 'Mensual') {
			setDisparadorOptions(opcionesDisparador);
		} else if (
			periodicidad === 'Fecha determinada' ||
			periodicidad === '2 Fechas determinadas'
		) {
			setDisparadorOptions([{ value: 'Fecha', label: 'Fecha' }]);
		} else {
			setDisparadorOptions([]);
		}
	}, [periodicidad, resetField]);

	useEffect(() => {
		async function fetchDistribution() {
			const snap = await getDocs(collection(db, 'correosDistribucion'));
			const opts = snap.docs.map((doc) => ({
				value: doc.id,
				label: doc.data().email as string,
			}));
			setDistributionOptions(opts);
		}
		fetchDistribution();
	}, []);

	useEffect(() => {
		if (disparador !== 'Campo') {
			resetField('origen');
			resetField('campo');
		}
		if (disparador !== 'Fecha') {
			resetField('fecha1');
			resetField('fecha2');
		}
		if (!(periodicidad === 'Mensual' && disparador === 'Fecha')) {
			resetField('dia');
		}
	}, [disparador, periodicidad, resetField]);

	useEffect(() => {
		cargaPersonalPaginado(100, 1);
	}, []);

	useEffect(() => {
		if (tipoDestino !== 'Email institucional') return;

		const emails: string[] = [];

		personal.forEach((p) => {
			if (!p.estado || !p.emailInstitucional) return;

			if (tipoSeleccionCorreoInstitucional === 'todos') {
				emails.push(p.emailInstitucional);
			} else if (
				tipoSeleccionCorreoInstitucional === 'relacion' &&
				p.relacion?.trim().toLowerCase() ===
					relacionSeleccionada?.trim().toLowerCase()
			) {
				emails.push(p.emailInstitucional);
			}
		});

		if (emails.length > 0) {
			setValue('enviarA', emails);
		}
	}, [
		tipoSeleccionCorreoInstitucional,
		relacionSeleccionada,
		tipoDestino,
		personal,
	]);

	useEffect(() => {
		const cargarTipos = async () => {
			const data = await obtenerTiposYTemplates();
			setTiposPlantilla(data.tipos);
			if (data.agrupado.length > 0) {
				setTipoSeleccionado(data.agrupado[0].tipo);
				setPlantillasFiltradas(data.agrupado[0].templates);
			}
		};
		cargarTipos();
	}, []);

	useEffect(() => {
		const cargarTemplatesPorTipo = async () => {
			const data = await obtenerTiposYTemplates();

			if (tipoSeleccionado === 'Todos') {
				const todas = data.agrupado.flatMap((g) => g.templates);
				setPlantillasFiltradas(todas);
			} else {
				const match = data.agrupado.find((g) => g.tipo === tipoSeleccionado);
				setPlantillasFiltradas(match?.templates || []);
			}
		};

		if (tipoSeleccionado) {
			cargarTemplatesPorTipo();
		}
	}, [tipoSeleccionado]);

	const onSubmit = async (data: NotificacionData) => {
		const notificacionesData = {
			...data,
			fecha1: toISO(data.fecha1),
			fecha2: toISO(data.fecha2),
			creadoPor: user?.uid ?? '',
		};

		if (data.tipoDestino === 'Correo de distribución') {
			notificacionesData.tipoSeleccionCorreoInstitucional = '';
			notificacionesData.relacionDestino = '';
		} else if (data.tipoSeleccionCorreoInstitucional === 'todos') {
			notificacionesData.relacionDestino = '';
		}

		try {
			if (notificacionExistente) {
				await editarNotificacion(notificacionesData);
				toast.success('Notificación editada correctamente');
			} else {
				await crearNotificacion(notificacionesData);
				toast.success('Notificación creada correctamente');
			}
			onSuccess?.();
		} catch (error) {
			toast.error('Error al crear notificación');
		}
	};

	useEffect(() => {
		if (!tipoSeleccionado) return;
		setValue(
			'origen',
			tipoSeleccionado === 'Feriado' ? 'feriados' : 'personal'
		);
		setOrigenDetectado(true);
	}, [tipoSeleccionado, setValue]);

	return (
		<form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
			<div className='grid grid-cols-2 gap-4'>
				<div>
					<Label htmlFor='nombre'>Nombre</Label>
					<Input
						id='nombre'
						placeholder='Ingrese el Nombre'
						{...register('nombre', { required: 'El nombre es obligatorio' })}
						className={errors.nombre ? 'border-red-500' : ''}
					/>
					{errors.nombre && (
						<p className='text-red-500 text-xs mt-1'>{errors.nombre.message}</p>
					)}
				</div>
				<div>
					<Label>Tipo de plantilla</Label>
					<Select
						onValueChange={(val) => setTipoSeleccionado(val)}
						value={tipoSeleccionado}
					>
						<SelectTrigger>
							<SelectValue placeholder='Seleccionar tipo' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='Todos'>Todos</SelectItem>
							{tiposPlantilla.map((tipo) => (
								<SelectItem key={tipo} value={tipo}>
									{tipo}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>
			<div className='grid grid-cols-1 gap-4'>
				{tipoSeleccionado && (
					<div>
						<Label htmlFor='plantilla'>Plantilla</Label>
						<Controller
							name='plantilla'
							control={control}
							defaultValue={notificacionExistente?.plantilla ?? ''}
							rules={{ required: 'La plantilla es obligatoria' }}
							render={({ field }) => (
								<Select value={field.value} onValueChange={field.onChange}>
									<SelectTrigger
										className={errors.plantilla ? 'border-red-500' : ''}
									>
										<SelectValue placeholder='Seleccionar plantilla' />
									</SelectTrigger>
									<SelectContent>
										{plantillasFiltradas.map((opt) => (
											<SelectItem key={opt.value} value={opt.value}>
												{opt.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						/>
						{errors.plantilla && (
							<p className='text-red-500 text-xs mt-1'>
								{errors.plantilla.message}
							</p>
						)}
					</div>
				)}
			</div>
			<div className='grid grid-cols-2 gap-4'>
				<div>
					<Label htmlFor='periodicidad'>Periodicidad</Label>
					<Controller
						name='periodicidad'
						control={control}
						defaultValue={notificacionExistente?.periodicidad ?? ''}
						rules={{ required: 'La periodicidad es obligatoria' }}
						render={({ field }) => (
							<Select
								value={field.value}
								onValueChange={field.onChange}
								disabled={!plantilla}
							>
								<SelectTrigger
									className={errors.periodicidad ? 'border-red-500' : ''}
								>
									<SelectValue placeholder='Seleccionar periodicidad' />
								</SelectTrigger>
								<SelectContent>
									{opcionesPeriodicidad.map((opt) => (
										<SelectItem key={opt.value} value={opt.value}>
											{opt.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					/>
					{errors.periodicidad && (
						<p className='text-red-500 text-xs mt-1'>
							{errors.periodicidad.message}
						</p>
					)}
				</div>
				<div>
					<Label htmlFor='disparadorEvento'>Disparador del evento</Label>
					<Controller
						name='disparadorEvento'
						control={control}
						rules={{ required: 'El disparador es obligatorio' }}
						render={({ field }) => (
							<Select
								value={field.value || ''}
								onValueChange={field.onChange}
								disabled={!periodicidad}
							>
								<SelectTrigger
									className={errors.disparadorEvento ? 'border-red-500' : ''}
								>
									<SelectValue placeholder='Seleccionar disparador' />
								</SelectTrigger>
								<SelectContent>
									{disparadorOptions.map((opt) => (
										<SelectItem key={opt.value} value={opt.value}>
											{opt.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					/>
					{errors.disparadorEvento && (
						<p className='text-red-500 text-xs mt-1'>
							{errors.disparadorEvento.message}
						</p>
					)}
				</div>
			</div>

			<div>
				{periodicidad === 'Mensual' && disparador === 'Fecha' && (
					<Controller
						name='dia'
						control={control}
						defaultValue={notificacionExistente?.dia ?? ''}
						rules={{ required: 'Debes elegir un día' }}
						render={({ field, fieldState }) => (
							<div>
								<div className='flex items-center gap-2'>
									<Label>Día del mes: </Label>
									<DayGridDropdown
										placeholder='Ingrese día'
										value={field.value}
										onChange={field.onChange}
										buttonClassName={errors.dia ? 'border-red-500' : ''}
									/>
									{fieldState.error && (
										<p className='text-red-500 text-xs mt-1'>
											{fieldState.error.message}
										</p>
									)}
								</div>
								<div>
									{['29', '30', '31'].includes(field.value) && (
										<p className='text-xs text-[rgba(0,0,0,0.84)] mt-1 drop-shadow-md'>
											Dado que esa fecha no existe en todos los meses, se
											utilizará automáticamente el último día disponible de cada
											mes.
										</p>
									)}
								</div>
							</div>
						)}
					/>
				)}

				{periodicidad === 'Anual' && disparador === 'Fecha' && (
					<div className='flex items-center'>
						<Controller
							name='diaMes'
							control={control}
							rules={{ required: 'Debes elegir día y mes' }}
							defaultValue={notificacionExistente?.diaMes ?? ''}
							render={({ field, fieldState }) => {
								const [initDia, initMes] = (field.value || '').split('/');
								const [dia, setDia] = useState(initDia || '');
								const [mes, setMes] = useState(initMes || '');

								useEffect(() => {
									if (dia && mes) {
										field.onChange(`${dia}/${mes}`);
									} else {
										field.onChange('');
									}
								}, [dia, mes]);

								useEffect(() => {
									setDia('');
								}, [mes]);

								const maxDays =
									mes === '02'
										? 28
										: ['04', '06', '09', '11'].includes(mes)
										? 30
										: 31;

								return (
									<div>
										<div className='flex items-center gap-2'>
											<Label>Día y mes: </Label>

											<MonthGridDropdown
												value={mes}
												onChange={setMes}
												placeholder='Mes'
												buttonClassName={
													fieldState.error ? 'border-red-500' : ''
												}
											/>

											<DayGridDropdown
												value={dia}
												onChange={setDia}
												placeholder='Día'
												disabled={!mes}
												maxDays={maxDays}
												buttonClassName={
													fieldState.error ? 'border-red-500' : ''
												}
											/>
										</div>
										<div>
											{['29', '30', '31'].includes(dia) && (
												<p className='text-xs text-[rgba(0,0,0,0.84)] mt-1 drop-shadow-md'>
													Dado que esa fecha no existe en todos los meses, se
													utilizará automáticamente el último día disponible de
													cada mes.
												</p>
											)}
										</div>
									</div>
								);
							}}
						/>

						{errors.diaMes && (
							<p className='text-red-500 text-xs mt-1 ml-[1rem]'>
								{errors.diaMes.message}
							</p>
						)}
					</div>
				)}
			</div>

			{disparador === 'Campo' && (
				<div className='grid grid-cols-2 gap-4'>
					<div>
						<Label htmlFor='origen'>Origen</Label>
						<Controller
							name='origen'
							control={control}
							rules={{ required: 'El origen es obligatorio' }}
							render={({ field }) => (
								<Select
									onValueChange={field.onChange}
									value={field.value}
									disabled={origenDetectado}
								>
									<SelectTrigger
										className={errors.origen ? 'border-red-500' : ''}
									>
										<SelectValue placeholder='Seleccionar origen' />
									</SelectTrigger>
									<SelectContent>
										{opcionesOrigen.map((opt) => (
											<SelectItem key={opt.value} value={opt.value}>
												{opt.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						/>
						{errors.origen && (
							<p className='text-red-500 text-xs mt-1'>
								{errors.origen.message}
							</p>
						)}
					</div>

					<div>
						<Label htmlFor='campo'>Campo</Label>
						<Controller
							name='campo'
							control={control}
							rules={{ required: 'El campo es obligatorio' }}
							render={({ field }) => (
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}
								>
									<SelectTrigger
										className={errors.campo ? 'border-red-500' : ''}
									>
										<SelectValue placeholder='Seleccionar campo' />
									</SelectTrigger>
									<SelectContent>
										{opcionesCampoActual.map((opt) => (
											<SelectItem key={opt.value} value={opt.value}>
												{opt.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						/>
						{errors.campo && (
							<p className='text-red-500 text-xs mt-1'>
								{errors.campo.message}
							</p>
						)}
					</div>
				</div>
			)}
			{disparador === 'Fecha' && periodicidad === 'Fecha determinada' && (
				<div>
					<Label htmlFor='fecha1'>Fecha 1</Label>
					<Input
						id='fecha1'
						type='date'
						min={today}
						{...register('fecha1', { required: 'La Fecha 1 es obligatoria' })}
						className={errors.fecha1 ? 'border-red-500' : ''}
					/>
					{errors.fecha1 && (
						<p className='text-red-500 text-xs mt-1'>{errors.fecha1.message}</p>
					)}
				</div>
			)}
			{disparador === 'Fecha' && periodicidad === '2 Fechas determinadas' && (
				<div className='grid grid-cols-2 gap-4'>
					<div>
						<Label htmlFor='fecha1'>Fecha 1</Label>
						<Input
							id='fecha1'
							type='date'
							min={today}
							{...register('fecha1', { required: 'La Fecha 1 es obligatoria' })}
							className={errors.fecha1 ? 'border-red-500' : ''}
						/>
						{errors.fecha1 && (
							<p className='text-red-500 text-xs mt-1'>
								{errors.fecha1.message}
							</p>
						)}
					</div>
					<div>
						<Label htmlFor='fecha2'>Fecha 2</Label>
						<Input
							id='fecha2'
							type='date'
							min={today}
							{...register('fecha2', { required: 'La Fecha 2 es obligatoria' })}
							className={errors.fecha2 ? 'border-red-500' : ''}
						/>
						{errors.fecha2 && (
							<p className='text-red-500 text-xs mt-1'>
								{errors.fecha2.message}
							</p>
						)}
					</div>
				</div>
			)}

			<div>
				<Label htmlFor='tipoDestino'>Enviar a</Label>
				<Controller
					name='tipoDestino'
					control={control}
					defaultValue={notificacionExistente?.tipoDestino ?? ''}
					rules={{ required: 'El tipo de destino es obligatorio' }}
					render={({ field }) => (
						<Select onValueChange={field.onChange} value={field.value}>
							<SelectTrigger
								className={errors.tipoDestino ? 'border-red-500' : ''}
							>
								<SelectValue placeholder='Seleccionar tipo de destino' />
							</SelectTrigger>
							<SelectContent>
								{opcionesEnviarA.map((opt) => (
									<SelectItem key={opt.value} value={opt.value}>
										{opt.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}
				/>
				{errors.tipoDestino && (
					<p className='text-red-500 text-xs mt-1'>
						{errors.tipoDestino.message}
					</p>
				)}
			</div>
			{tipoDestino === 'Email institucional' && (
				<div>
					<Label>Seleccionar tipo de envío</Label>
					<Controller
						control={control}
						name='tipoSeleccionCorreoInstitucional'
						render={({ field }) => (
							<RadioGroup
								onValueChange={field.onChange}
								value={field.value}
								className='flex gap-4 mt-2'
							>
								<div className='flex items-center space-x-2'>
									<RadioGroupItem value='todos' id='r1' />
									<Label htmlFor='r1'>Todos</Label>
								</div>
								<div className='flex items-center space-x-2'>
									<RadioGroupItem value='relacion' id='r2' />
									<Label htmlFor='r2'>Relación con la empresa</Label>
								</div>
							</RadioGroup>
						)}
					/>
				</div>
			)}
			{tipoSeleccionCorreoInstitucional === 'relacion' &&
				tipoDestino === 'Email institucional' && (
					<div className='mt-2'>
						<Label>Relación</Label>
						<Controller
							name='relacionDestino'
							control={control}
							render={({ field }) => (
								<Select onValueChange={field.onChange} value={field.value}>
									<SelectTrigger>
										<SelectValue placeholder='Seleccionar relación' />
									</SelectTrigger>
									<SelectContent>
										{opcionesRelacion.map((opt) => (
											<SelectItem key={opt.value} value={opt.value}>
												{opt.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						/>
					</div>
				)}

			{tipoDestino === 'Correo de distribución' && (
				<div>
					<Label htmlFor='correoDistribucion'>Seleccionar correo</Label>
					<Controller
						name='enviarA'
						control={control}
						rules={{ required: 'Debes seleccionar al menos un correo' }}
						render={({ field }) => {
							const selectedEmail =
								Array.isArray(field.value) &&
								field.value.length > 0 &&
								field.value[0]
									? field.value[0]
									: '';

							return (
								<Select
									value={selectedEmail}
									onValueChange={(val) => field.onChange([val])}
								>
									<SelectTrigger
										className={errors.enviarA ? 'border-red-500' : ''}
									>
										<span className='truncate'>
											{selectedEmail
												? correos?.correoDistribucion.find(
														(c) => c.email === selectedEmail
												  )?.denominacion || selectedEmail
												: 'Seleccionar correos'}
										</span>
									</SelectTrigger>

									<SelectContent>
										{correos &&
											correos.correoDistribucion
												.filter((c) => c.estado)
												.map((c) => (
													<SelectItem key={c.email} value={c.email}>
														<div className='flex flex-col'>
															<span className='font-medium'>
																{c.denominacion}
															</span>
															<span className='text-xs text-gray-500'>
																{c.email}
															</span>
														</div>
													</SelectItem>
												))}
									</SelectContent>
								</Select>
							);
						}}
					/>

					{errors.enviarA && (
						<p className='text-red-500 text-xs mt-1'>
							{errors.enviarA.message}
						</p>
					)}
				</div>
			)}

			<div className='flex items-center gap-6'>
				<div className='flex items-center gap-2'>
					<Controller
						name='estado'
						control={control}
						render={({ field }) => (
							<Checkbox
								id='estado'
								checked={field.value}
								onCheckedChange={(val) => field.onChange(!!val)}
							/>
						)}
					/>
					<Label htmlFor='estado'>Habilitado</Label>
				</div>
			</div>

			<div className='flex justify-end gap-2 mt-6'>
				<DialogClose asChild>
					<Button type='button' variant='outline'>
						Cancelar
					</Button>
				</DialogClose>
				<Button type='submit' disabled={isSubmitting}>
					Guardar
				</Button>
			</div>
		</form>
	);
}
