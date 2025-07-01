'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { toast } from 'react-toastify';

interface MailContextProps {
	senderEmail: string;
	fetchSenderEmail: () => Promise<void>;
	updateSenderEmail: (newEmail: string) => Promise<void>;
	sendEmail: ({
		to,
		subject,
		message,
	}: {
		to: string;
		subject: string;
		message: string;
	}) => Promise<{ success: boolean; message: string } | undefined>;
}

const MailContext = createContext<MailContextProps | undefined>(undefined);

export const MailProvider = ({ children }: { children: React.ReactNode }) => {
	const [senderEmail, setSenderEmail] = useState('');

	const fetchSenderEmail = async () => {
		try {
			const res = await fetch('/api/get-mail-envio');
			const data = await res.json();
			if (data.senderEmail) {
				setSenderEmail(data.senderEmail);
			}
		} catch (err) {
			console.error('Error al obtener el correo de envío:', err);
		}
	};

	const updateSenderEmail = async (newEmail: string) => {
		const auth = getAuth();
		const userEmail = auth.currentUser?.email;

		if (!userEmail) {
			toast.error('No se pudo obtener el usuario autenticado');
			return;
		}

		try {
			const res = await fetch('/api/update-mail-envio', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					newSenderEmail: newEmail,
					userEmail: userEmail,
				}),
			});

			const data = await res.json();

			if (res.ok) {
				setSenderEmail(newEmail);
				toast.success('Correo actualizado exitosamente');
			} else {
				toast.error(data.error || 'Ocurrió un error');
			}
		} catch (err) {
			console.error('Error actualizando el correo:', err);
			toast.error('Error inesperado');
		}
	};

	const sendEmail = async ({
		to,
		subject,
		message,
	}: {
		to: string;
		subject: string;
		message: string;
	}) => {
		if (!senderEmail) {
			console.error('No hay correo remitente configurado');
			return;
		}

		const res = await fetch('/api/enviar-mail', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				to,
				subject,
				message,
				senderEmail,
			}),
		});

		const result = await res.json();
		return result;
	};

	useEffect(() => {
		fetchSenderEmail();
	}, []);

	return (
		<MailContext.Provider
			value={{ senderEmail, fetchSenderEmail, updateSenderEmail, sendEmail }}
		>
			{children}
		</MailContext.Provider>
	);
};

export const useMail = () => {
	const context = useContext(MailContext);
	if (!context) throw new Error('useMail debe usarse dentro de MailProvider');
	return context;
};
