import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { AuthProvider } from '@/contexts/authContext';
import { PersonalProvider } from '@/contexts/personalContext';
import { ToastContainer } from 'react-toastify';
import { MailProvider } from '@/contexts/mailContext';
import { TemplateProvider } from '@/contexts/templateContext';
import { NotificationProvider } from '../contexts/notificacionContext';
import { CorreosDistribucionProvider } from '@/contexts/correosDistribucionContext';

export const metadata: Metadata = {
	title: 'RRHH - Notificaciones',
	description: 'Gestione eventos y notificaciones de RRHH fácilmente.',
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang='en' className={GeistSans.variable} suppressHydrationWarning>
			<body className='font-sans antialiased'>
				<AuthProvider>
					<MailProvider>
						<CorreosDistribucionProvider>
							<PersonalProvider>
								<NotificationProvider>
									<TemplateProvider>{children}</TemplateProvider>
								</NotificationProvider>
								<ToastContainer position='top-right' autoClose={3000} />
							</PersonalProvider>
						</CorreosDistribucionProvider>
					</MailProvider>
				</AuthProvider>
			</body>
		</html>
	);
}
