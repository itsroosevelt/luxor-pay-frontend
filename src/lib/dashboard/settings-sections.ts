import type { LucideIcon } from 'lucide-react';
import {
  User,
  Mail,
  Code2,
  Building2,
  Users,
  Percent,
  BadgeCheck,
  FileCheck2,
  FlaskConical,
  Gift,
  Receipt,
  Landmark,
  Shield,
} from 'lucide-react';

export interface SettingsTileConfig {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface SettingsSectionConfig {
  id: string;
  title: string;
  tiles: SettingsTileConfig[];
}

export const SETTINGS_SECTIONS: SettingsSectionConfig[] = [
  {
    id: 'personal',
    title: 'Configuración personal',
    tiles: [
      {
        href: '/dashboard/settings/profile',
        title: 'Datos personales',
        description: 'Información de contacto, contraseña, métodos de autenticación y sesiones activas.',
        icon: User,
      },
      {
        href: '/dashboard/settings/communication',
        title: 'Preferencias de comunicación',
        description: 'Personaliza los correos, SMS y notificaciones push que recibes.',
        icon: Mail,
      },
      {
        href: '/dashboard/settings/desarrolladores',
        title: 'Desarrolladores',
        description: 'Workbench, claves de API, webhooks y eventos de tu integración Solana.',
        icon: Code2,
      },
    ],
  },
  {
    id: 'account',
    title: 'Configuración de cuenta',
    tiles: [
      {
        href: '/dashboard/settings/empresa',
        title: 'Empresa',
        description: 'Datos de la cuenta, marca, dominios y detalles del comercio.',
        icon: Building2,
      },
      {
        href: '/dashboard/settings/equipo',
        title: 'Equipo y seguridad',
        description: 'Miembros del equipo, roles, seguridad y registros de auditoría.',
        icon: Users,
      },
      {
        href: '/dashboard/settings/planes',
        title: 'Planes y comisiones',
        description: 'Suscripción, tarifas de procesamiento y facturación de Luxor Pay.',
        icon: Percent,
      },
      {
        href: '/dashboard/settings/perfil',
        title: 'Perfil de Luxor Pay',
        description: 'Marca pública, políticas y apariencia del checkout para tus clientes.',
        icon: BadgeCheck,
      },
      {
        href: '/dashboard/settings/cumplimiento',
        title: 'Cumplimiento y documentos',
        description: 'Verificación de identidad, documentos y requisitos regulatorios.',
        icon: FileCheck2,
      },
      {
        href: '/dashboard/settings/funcionalidades',
        title: 'Funcionalidades y versiones preliminares',
        description: 'Activa productos nuevos y accede a funciones en vista previa.',
        icon: FlaskConical,
      },
      {
        href: '/dashboard/settings/ventajas',
        title: 'Ventajas',
        description: 'Beneficios para comercios y promociones de socios.',
        icon: Gift,
      },
    ],
  },
  {
    id: 'product',
    title: 'Configuración del producto',
    tiles: [
      {
        href: '/dashboard/billing',
        title: 'Billing',
        description: 'Suscripciones, facturas, recuperación de ingresos y uso medido.',
        icon: Receipt,
      },
      {
        href: '/dashboard/settings/impuesto',
        title: 'Impuesto',
        description: 'Registros fiscales, cálculo automático y documentación de impuestos.',
        icon: Landmark,
      },
      {
        href: '/dashboard/radar',
        title: 'Radar',
        description: 'Reglas de fraude, listas de bloqueo y revisiones de riesgo.',
        icon: Shield,
      },
    ],
  },
];
