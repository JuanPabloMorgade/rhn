'use client';
import { UserData, UsersDataState } from '@/interfaces/user';
import {
  getAuth,
  sendPasswordResetEmail,
  updatePassword,
  User,
} from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
  setPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db, firebaseConfig } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { initializeApp, deleteApp } from 'firebase/app';
import { fechaAhora, fechaFormateada } from '@/helpers/helpers';

interface AuthContextProps {
  user: User | null;
  userInfo: UserData | undefined;
  usersData: UsersDataState | undefined;
  accessToken: string | null;
  secret: string | undefined;
  isLoading: boolean;
  isLogged: boolean;
  setUserInfo: (value: UserData | undefined) => void;
  setIsLogged: (value: boolean) => void;
  registerFirebase: (nuevoUsuario: UserData) => Promise<UserCredential>;
  signInFirebase: (email: string, password: string) => Promise<UserCredential>;
  logoutFirebase: () => Promise<void>;
  cargaUsuariosPaginado: (limit: number, page: number) => Promise<void>;
  editarUsuarioFirebase: (
    usuarioActualizado: UserData
  ) => Promise<boolean> | undefined;
  enviarCorreoRestablecimiento: (email: string) =>
    | Promise<{
        success: boolean;
        message: string;
      }>
    | undefined;
  contarActivos: () => Promise<number>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { push } = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [userInfo, setUserInfo] = useState<UserData | undefined>(undefined);
  const [usersData, setUsersData] = useState<UsersDataState | undefined>(
    undefined
  );
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLogged, setIsLogged] = useState<boolean>(false);

  const getUserInfo = async (uid: string) => {
    const docRef = doc(db, 'usuarios', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserData;
    }
    return undefined;
  };

  const getUsersInfo = async (limit: number, pagina: number) => {
    const usuariosCol = collection(db, 'usuarios');
    const usuariosSnap = await getDocs(
      query(usuariosCol, orderBy('nombre', 'asc'))
    );

    const todosUsuarios: UserData[] = [];
    const uidToNombre: Record<string, string> = {};

    usuariosSnap.forEach((doc) => {
      const data = doc.data() as UserData;
      uidToNombre[doc.id] = `${data.nombre} ${data.apellido}`;
      todosUsuarios.push({ ...data, uid: doc.id });
    });

    const totalUsuarios = todosUsuarios.length;
    const inicio = (pagina - 1) * limit;
    const fin = inicio + limit;

    const usuariosPaginados = todosUsuarios
      .slice(inicio, fin)
      .map((usuario) => {
        const creadorUID = usuario.creadoPor;
        const nombreCreador = uidToNombre[creadorUID] || 'Desconocido';
        return {
          ...usuario,
          creadoPor: nombreCreador,
        };
      });

    return {
      usuarios: usuariosPaginados,
      datosPagina: {
        totalDatos: usuariosPaginados.length,
        sigPaginado: fin < totalUsuarios,
        antPaginado: inicio > 0,
        usuarios: totalUsuarios,
      },
    };
  };

  const cargaUsuariosPaginado = async (limit: number, page: number) => {
    const data = await getUsersInfo(limit, page);
    setUsersData(data);
  };

  const registerFirebase = async (nuevoUsuario: UserData) => {
    try {
      const secondaryApp = initializeApp(firebaseConfig, 'Secondary');
      const secondaryAuth = getAuth(secondaryApp);

      const cred = await createUserWithEmailAndPassword(
        secondaryAuth,
        nuevoUsuario.email,
        nuevoUsuario.contraseña ?? ''
      );

      await setDoc(doc(db, 'usuarios', cred.user.uid), {
        uid: cred.user.uid,
        nombre: nuevoUsuario.nombre,
        apellido: nuevoUsuario.apellido,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol,
        status: nuevoUsuario.status,
        eliminado: nuevoUsuario.eliminado,
        fecha: fechaFormateada,
        creadoPor: nuevoUsuario.creadoPor,
      });

      await deleteApp(secondaryApp);

      return cred;
    } catch (error) {
      console.error('Error al registrar el usuario:', error);
      throw new Error('Error al registrar el usuario');
    }
  };

  const editarUsuarioFirebase = async (usuarioActualizado: UserData) => {
    try {
      await updateDoc(doc(db, 'usuarios', usuarioActualizado.uid), {
        nombre: usuarioActualizado.nombre,
        apellido: usuarioActualizado.apellido,
        email: usuarioActualizado.email,
        rol: usuarioActualizado.rol,
        status: usuarioActualizado.status,
      });

      return true;
    } catch (error) {
      console.error('Error al actualizar el usuario:', error);
      throw new Error('Error al actualizar el usuario');
    }
  };

  const enviarCorreoRestablecimiento = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true, message: 'Correo de restablecimiento enviado.' };
    } catch (error) {
      console.error('Error al enviar correo:', error);
      throw new Error('No se pudo enviar el correo de restablecimiento.');
    }
  };

  const signInFirebase = async (email: string, password: string) => {
    try {
      await setPersistence(auth, browserSessionPersistence);
      const cred = await signInWithEmailAndPassword(auth, email, password);
      return cred;
    } catch (error) {
      console.error('Error al loguear el usuario:', error);
      throw new Error('signInWithEmailAndPassword: Ocurrió un error');
    }
  };

  const logoutFirebase = async () => {
    try {
      const cred = await signOut(auth);
      sessionStorage.removeItem('accessToken');
      return cred;
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw new Error('Error al cerrar sesión');
    }
  };

  // Escucha de cambios en el estado de autenticación y redirección de rutas
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);

      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        setAccessToken(token);
        sessionStorage.setItem('accessToken', token);

        const info = await getUserInfo(firebaseUser.uid);
        setUser(firebaseUser);
        setUserInfo(info);
        setIsLogged(true);

        // Redirigir sólo si todavía no se está en panel
        if (pathname === '/' || pathname === '/login') {
          push('/panel-control');
        }
      } else {
        setUser(null);
        setAccessToken(null);
        setUserInfo(undefined);
        setIsLogged(false);

        const isProtected = [
          '/',
          '/panel-control',
          '/ajustes',
          '/notificaciones',
          '/usuarios',
          '/personal',
          '/templates',
        ].some((route) => pathname.startsWith(route));

        if (isProtected) {
          push('/login');
        }
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const contarActivos = async (): Promise<number> => {
    const personalCol = collection(db, 'usuarios');
    const qActivos = query(personalCol, where('status', '==', true));
    const snap = await getDocs(qActivos);
    return snap.size;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userInfo,
        setUserInfo,
        usersData,
        accessToken,
        secret,
        isLoading,
        registerFirebase,
        signInFirebase,
        logoutFirebase,
        isLogged,
        setIsLogged,
        cargaUsuariosPaginado,
        editarUsuarioFirebase,
        enviarCorreoRestablecimiento,
        contarActivos,
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
