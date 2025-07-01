'use client';
import React, { ChangeEvent, FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/authContext';
import { useRouter } from 'next/navigation';

export default function Login() {
  const { signInFirebase } = useAuth();
  const router = useRouter();

  const [formState, setFormState] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const resp = await signInFirebase(formState.email, formState.password);
      if (resp) {
        router.push('/panel-control');
      }
    } catch (err) {
      setError('Credenciales inválidas. Inténtalo de nuevo.');
      console.error('Login error:', err);
    }
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row justify-center items-center w-full">
      <Card className="">
        <form className="flex flex-col gap-4 p-6" onSubmit={handleSubmit}>
          <div className="mt-[24px] 2xl:mt-[54px] text-primary font-lato text-[1.5rem] font-bold leading-[normal]">
            Iniciar sesión
          </div>
          <div className="mb-[24px] 2xl:mb-[34px] text-black font-lato text-lg 2xl:text-xl font-medium leading-[normal]">
            ¡Te damos la bienvenida a RRHH - Notificaciones! <br /> Tu portal de
            gestión para Recursos Humanos
          </div>

          {error && (
            <div className="text-red-600 text-sm font-medium">{error}</div>
          )}

          <div>
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              name="email"
              value={formState.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="mb-6">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              onChange={handleInputChange}
              type="password"
              value={formState.password}
              required
            />
          </div>

          <button
            className="mb-[24px] 2xl:mb-[34px] text-end text-[#0080809f] font-lato text-base 2xl:text-xl leading-[normal]"
            type="button"
            onClick={() => {
              /* router.push('/login/password-recovery'); */
            }}
          >
            ¿Olvidaste la contraseña?
          </button>

          <div className="text-center">
            <Button type="submit">Ingresar</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
