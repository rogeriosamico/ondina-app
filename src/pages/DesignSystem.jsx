import React, { useState, useRef } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import BeachCard from "@/components/BeachCard";
import DayCard from "@/components/DayCard";
import { DayCardSkeleton } from "@/components/Skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getToday, addDays } from "@/lib/dates";
import { Search, Heart, Share, Palette, Component as ComponentIcon, PanelLeft, PanelLeftClose, MessageCircle, Send, Mail, ExternalLink, Check, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, Wind, Timer, Sun, Cloud, CloudRain, CloudLightning, Moon, CloudMoon, CloudMoonRain, Menu, MapPin, LogOut, Camera, Info, X, Calendar as CalendarIcon } from "lucide-react";
import SwellPowerBar from "@/components/SwellPowerBar";
import Header from "@/components/Header";
import DateFilterModal from "@/components/DateFilterModal";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { ptBR } from "date-fns/locale";
import { format } from "date-fns";
import InfoBlock from "@/components/InfoBlock";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import TideChart from "@/components/TideChart";
import TimeSlider from "@/components/TimeSlider";
import StateMessage, { ErrorState } from "@/components/StateMessage";

/** Reads a live CSS variable value from :root */
function getCSSVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

const DesignSystem = () => {
  const [activeTab, setActiveTab] = useState('fundamentos');
  const [activeSubTab, setActiveSubTab] = useState('cores');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    {
      id: 'fundamentos',
      label: 'Fundamentos',
      icon: Palette,
      subItems: [
        { id: 'cores', label: 'Cores' },
        { id: 'tipografia', label: 'Tipografia' },
        { id: 'espacamento', label: 'Espaçamento' },
        { id: 'radius', label: 'Radius' },
        { id: 'icones', label: 'Ícones' },
      ]
    },
    {
      id: 'componentes',
      label: 'Componentes',
      icon: ComponentIcon,
      subItems: [
        { id: 'badges', label: 'Badges' },
        { id: 'botoes', label: 'Botões' },
        { id: 'inputs', label: 'Inputs' },
        { id: 'cards', label: 'Cards' },
        { id: 'daycard', label: 'Day Card' },
        { id: 'tabs', label: 'Tabs' },
        { id: 'slider', label: 'Slider' },
        { id: 'infoblock', label: 'Info Block' },
        { id: 'header', label: 'Header' },
        { id: 'modal', label: 'Modal' },
        { id: 'calendar', label: 'Calendário' },
        { id: 'swellpower', label: 'Swell Power Bar' },
        { id: 'tidechart', label: 'Tide Chart' },
        { id: 'dropdown', label: 'Dropdown Menu' },
        { id: 'estados', label: 'Estados' },
      ]
    },
    {
      id: 'auth',
      label: 'Auth Pages',
      icon: ComponentIcon,
      subItems: [
        { id: 'auth-login', label: 'Login' },
        { id: 'auth-register', label: 'Cadastro' },
        { id: 'auth-forgot', label: 'Esqueci a senha' },
        { id: 'auth-reset', label: 'Nova senha' },
      ]
    }
  ];

  const renderContent = () => {
    if (activeTab === 'fundamentos') {
      if (activeSubTab === 'cores') return <ColorsSection />;
      if (activeSubTab === 'tipografia') return <TypographySection />;
      if (activeSubTab === 'espacamento') return <SpacingSection />;
      if (activeSubTab === 'radius') return <RadiusSection />;
      if (activeSubTab === 'icones') return <IconesSection />;
    }
    if (activeTab === 'componentes') {
      if (activeSubTab === 'badges') return <BadgesSection />;
      if (activeSubTab === 'botoes') return <ButtonsSection />;
      if (activeSubTab === 'inputs') return <InputsSection />;
      if (activeSubTab === 'cards') return <CardsSection />;
      if (activeSubTab === 'daycard') return <DayCardSection />;
      if (activeSubTab === 'tabs') return <TabsSection />;
      if (activeSubTab === 'slider') return <SliderSection />;
      if (activeSubTab === 'infoblock') return <InfoBlockSection />;
      if (activeSubTab === 'header') return <HeaderSection />;
      if (activeSubTab === 'modal') return <ModalSection />;
      if (activeSubTab === 'calendar') return <CalendarSection />;
      if (activeSubTab === 'swellpower') return <SwellPowerSection />;
      if (activeSubTab === 'tidechart') return <TideChartSection />;
      if (activeSubTab === 'dropdown') return <DropdownMenuSection />;
      if (activeSubTab === 'estados') return <StatesSection />;
    }
    if (activeTab === 'auth') {
      if (activeSubTab === 'auth-login') return <AuthPagePreview title="Login"><LoginPage /></AuthPagePreview>;
      if (activeSubTab === 'auth-register') return <AuthPagePreview title="Cadastro"><RegisterPage /></AuthPagePreview>;
      if (activeSubTab === 'auth-forgot') return <AuthPagePreview title="Esqueci a senha"><ForgotPasswordPage /></AuthPagePreview>;
      if (activeSubTab === 'auth-reset') return <AuthPagePreview title="Nova senha"><ResetPasswordPage /></AuthPagePreview>;
    }
    return <ColorsSection />;
  };

  const toggleBtnStyle = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 32, height: 32, borderRadius: 'var(--radius-minimal)',
    border: 'none', cursor: 'pointer', background: 'transparent',
    color: 'var(--text-invert)', flexShrink: 0,
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'var(--font-family)' }}>
      {/* Sidebar */}
      {sidebarOpen && (
        <aside style={{
          width: 240,
          background: 'var(--surface-secondary)',
          color: 'var(--text-invert)',
          position: 'fixed',
          height: '100vh',
          overflowY: 'auto',
        }}>
          <div style={{ padding: 'var(--spacing-md)', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 'var(--font-size-headline)', fontWeight: 'var(--font-weight-bold)', display: 'block' }}>Ondina</span>
              <span style={{ fontSize: 'var(--font-size-subtitle)', opacity: 0.4 }}>Design System</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} style={toggleBtnStyle} aria-label="Fechar sidebar">
              <PanelLeftClose size={18} />
            </button>
          </div>

          <nav style={{ padding: 'var(--spacing-md) var(--spacing-sm)' }}>
            {menuItems.map((item) => (
              <div key={item.id} style={{ marginBottom: 'var(--spacing-lg)' }}>
                <button
                  onClick={() => { setActiveTab(item.id); setActiveSubTab(item.subItems[0].id); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)',
                    width: '100%', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-minimal)',
                    border: 'none', cursor: 'pointer',
                    fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-bold)', fontFamily: 'var(--font-family)',
                    background: activeTab === item.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                    color: activeTab === item.id ? 'var(--text-invert)' : 'rgba(255,255,255,0.5)',
                  }}
                >
                  <item.icon size={16} />
                  {item.label}
                </button>
                <div style={{ marginLeft: 36, marginTop: 'var(--spacing-xs)' }}>
                  {item.subItems.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => { setActiveTab(item.id); setActiveSubTab(sub.id); }}
                      style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        padding: '6px var(--spacing-sm)', borderRadius: 'var(--radius-minimal)',
                        border: 'none', cursor: 'pointer',
                        fontSize: 'var(--font-size-body)', fontFamily: 'var(--font-family)',
                        background: 'transparent',
                        color: activeTab === item.id && activeSubTab === sub.id
                          ? 'var(--text-invert)'
                          : 'rgba(255,255,255,0.35)',
                        fontWeight: activeTab === item.id && activeSubTab === sub.id ? 'var(--font-weight-bold)' : 'var(--font-weight-regular)',
                      }}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </aside>
      )}

      {/* Botão para reabrir a sidebar quando fechada */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir sidebar"
          style={{
            position: 'fixed', top: 'var(--spacing-md)', left: 'var(--spacing-md)',
            zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, borderRadius: 'var(--radius-minimal)',
            border: '1px solid var(--border-primary)', cursor: 'pointer',
            background: 'var(--surface-primary)', color: 'var(--text-primary)',
          }}
        >
          <PanelLeft size={18} />
        </button>
      )}

      {/* Main */}
      <main style={{
        flex: 1,
        marginLeft: sidebarOpen ? 240 : 0,
        padding: 'var(--spacing-xl)',
        background: 'var(--surface-primary)',
        minHeight: '100vh',
      }}>
        <h2 style={{ fontSize: 'var(--font-size-title-sm)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-lg)' }}>
          {menuItems.flatMap(m => m.subItems).find(s => s.id === activeSubTab)?.label || activeSubTab}
        </h2>
        {renderContent()}
      </main>
    </div>
  );
};

/* =========================================
   FUNDAMENTOS
   ========================================= */

const colorTokens = {
  text: [
    { name: 'text-primary', figma: 'text/text-primary' },
    { name: 'text-secondary', figma: 'text/text-secondary' },
    { name: 'text-brand', figma: 'text/text-brand' },
    { name: 'text-invert', figma: 'text/text-invert' },
  ],
  conditions: [
    { name: 'text-storm', figma: 'text/text-storm' },
    { name: 'text-bom', figma: 'text/text-bom' },
    { name: 'text-marola', figma: 'text/text-marola' },
    { name: 'text-flat', figma: 'text/text-flat' },
  ],
  surface: [
    { name: 'surface-primary', figma: 'surface/surface-primary' },
    { name: 'surface-secondary', figma: 'surface/surface-secondary' },
    { name: 'surface-terciary', figma: 'surface/surface-terciary' },
  ],
  surfaceConditions: [
    { name: 'surface-storm-solid', figma: 'surface/surface-storm-solid' },
    { name: 'surface-bom-solid', figma: 'surface/surface-bom-solid' },
    { name: 'surface-marola-solid', figma: 'surface/surface-marola-solid' },
    { name: 'surface-flat-solid', figma: 'surface/surface-flat-solid' },
    { name: 'surface-storm-gradient', figma: 'surface/surface-storm-gradient' },
    { name: 'surface-bom-gradient', figma: 'surface/surface-bom-gradient' },
    { name: 'surface-marola-gradient', figma: 'surface/surface-marola-gradient' },
    { name: 'surface-flat-gradient', figma: 'surface/surface-flat-gradient' },
  ],
  border: [
    { name: 'border-primary', figma: 'border/border-primary' },
  ],
};

const ColorsSection = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>

    {/* Tokens neutros */}
    <div>
      <p style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-xs)' }}>Tokens neutros</p>
      <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
        Toda a interface fora do sistema de condições: textos, fundos, bordas, navegação e estados de loading.
      </p>
      <div style={{ marginBottom: 'var(--spacing-md)' }}>
        <ColorTable tokens={colorTokens.text} />
      </div>
      <div style={{ marginBottom: 'var(--spacing-md)' }}>
        <ColorTable tokens={colorTokens.surface} />
      </div>
      <ColorTable tokens={colorTokens.border} />
    </div>

    {/* Tokens de condição */}
    <div>
      <p style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-xs)' }}>Tokens de condição</p>
      <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
        Usados exclusivamente para indicar qualidade do mar. Cada condição tem 3 variantes: <code style={{ fontFamily: 'monospace' }}>--text-*</code> para texto sobre fundo neutro, <code style={{ fontFamily: 'monospace' }}>--surface-*-solid</code> para fundos opacos e <code style={{ fontFamily: 'monospace' }}>--surface-*-gradient</code> para fundos translúcidos.
      </p>
      <div style={{ marginBottom: 'var(--spacing-md)' }}>
        <ColorTable tokens={colorTokens.conditions} />
      </div>
      <ColorTable tokens={colorTokens.surfaceConditions} />
    </div>

  </div>
);

const ColorTable = ({ tokens }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Swatch</TableHead>
        <TableHead>Figma Variable</TableHead>
        <TableHead>CSS Variable</TableHead>
        <TableHead>Valor atual</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {tokens.map(t => (
        <TableRow key={t.name}>
          <TableCell style={{ padding: '12px 0' }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-minimal)', background: `var(--${t.name})`, border: '1px solid var(--border-primary)' }} />
          </TableCell>
          <TableCell style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{t.figma}</TableCell>
          <TableCell style={{ fontWeight: 'var(--font-weight-bold)' }}>--{t.name}</TableCell>
          <TableCell style={{ fontSize: 'var(--font-size-subtitle)', fontFamily: 'monospace' }}>{getCSSVar(`--${t.name}`)}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

// --- Typography ---

const typographyTokens = [
  { name: 'Title', sizeVar: '--font-size-title', weightVar: '--font-weight-bold', className: 'text-token-title' },
  { name: 'Title sm', sizeVar: '--font-size-title-sm', weightVar: '--font-weight-bold', className: 'text-token-title-sm' },
  { name: 'Headline', sizeVar: '--font-size-headline', weightVar: '--font-weight-bold', className: 'text-token-headline' },
  { name: 'Button label', sizeVar: '--font-size-button', weightVar: '--font-weight-bold', className: 'text-token-button' },
  { name: 'Input label', sizeVar: '--font-size-input-label', weightVar: '--font-weight-regular', className: 'text-token-input-label' },
  { name: 'Body', sizeVar: '--font-size-body', weightVar: '--font-weight-regular', className: 'text-token-body' },
  { name: 'Subtitle', sizeVar: '--font-size-subtitle', weightVar: '--font-weight-regular', className: 'text-token-subtitle' },
  { name: 'Subtitle bold', sizeVar: '--font-size-subtitle', weightVar: '--font-weight-bold', className: 'text-token-subtitle-bold' },
];

const TypographySection = () => (
  <div>
    <div style={{
      background: 'var(--surface-terciary)',
      borderRadius: 'var(--radius-minimal)',
      padding: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)',
    }}>
      <p style={{ fontSize: 'var(--font-size-subtitle)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)', fontFamily: 'monospace' }}>
        font-family
      </p>
      <p style={{ fontSize: 'var(--font-size-title-sm)', fontWeight: 'var(--font-weight-bold)' }}>Space Grotesk</p>
      <p style={{ fontSize: 'var(--font-size-subtitle)', color: 'var(--text-secondary)', marginTop: 'var(--spacing-xs)', fontFamily: 'monospace' }}>--font-family · Weights: 400, 700</p>
    </div>
    <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
      Cada classe token encapsula tamanho e peso juntos — nunca aplicar <code style={{ fontFamily: 'monospace' }}>font-size</code> e <code style={{ fontFamily: 'monospace' }}>font-weight</code> separadamente em componentes. As variáveis CSS (<code style={{ fontFamily: 'monospace' }}>--font-size-*</code>, <code style={{ fontFamily: 'monospace' }}>--font-weight-*</code>) são reservadas para contextos sem acesso a classes, como SVG labels e estilos inline no Recharts.
    </p>

    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Figma Variable</TableHead>
          <TableHead>CSS Variable</TableHead>
          <TableHead>Value</TableHead>
          <TableHead>Amostra</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {typographyTokens.map(t => (
          <TableRow key={t.name + t.className}>
            <TableCell style={{ padding: 'var(--spacing-md) 0', fontWeight: 'var(--font-weight-bold)' }}>{t.name}</TableCell>
            <TableCell style={{ padding: 'var(--spacing-md) 0', fontSize: 'var(--font-size-subtitle)', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
              {t.sizeVar} / {t.weightVar}
            </TableCell>
            <TableCell style={{ padding: 'var(--spacing-md) 0', fontSize: 'var(--font-size-subtitle)', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
              {getCSSVar(t.sizeVar)} · {getCSSVar(t.weightVar)}
            </TableCell>
            <TableCell style={{ padding: 'var(--spacing-md) 0', fontSize: `var(${t.sizeVar})`, fontWeight: `var(${t.weightVar})` }}>
              Ondina
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

// --- Spacing ---

const spacingTokens = [
  { name: 'spacing-none', figma: 'spacing/spacing-none' },
  { name: 'spacing-xs', figma: 'spacing/spacing-xs' },
  { name: 'spacing-sm', figma: 'spacing/spacing-sm' },
  { name: 'spacing-md', figma: 'spacing/spacing-md' },
  { name: 'spacing-lg', figma: 'spacing/spacing-lg' },
  { name: 'spacing-xl', figma: 'spacing/spacing-xl' },
];

const SpacingSection = () => (
  <div>
    <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
      Nunca usar valores de pixel avulsos em componentes reutilizáveis — sempre <code style={{ fontFamily: 'monospace' }}>var(--spacing-*)</code>. Exceção: <code style={{ fontFamily: 'monospace' }}>padding-top: 40px</code> e <code style={{ fontFamily: 'monospace' }}>padding-bottom: 80px</code> nos layouts de página (HomeScreen, BeachPage), que ainda não têm token formal.
    </p>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Figma Variable</TableHead>
          <TableHead>CSS Variable</TableHead>
          <TableHead>Value</TableHead>
          <TableHead>Preview</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {spacingTokens.map(t => (
          <TableRow key={t.name}>
            <TableCell style={{ padding: 'var(--spacing-md) 0', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{t.figma}</TableCell>
            <TableCell style={{ padding: 'var(--spacing-md) 0', fontWeight: 'var(--font-weight-bold)' }}>--{t.name}</TableCell>
            <TableCell style={{ padding: 'var(--spacing-md) 0', fontWeight: 'var(--font-weight-bold)' }}>{getCSSVar(`--${t.name}`)}</TableCell>
            <TableCell style={{ padding: 'var(--spacing-md) 0' }}>
              <div style={{ width: `max(var(--${t.name}), 2px)`, height: 20, background: 'var(--text-primary)', borderRadius: 2 }} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

// --- Radius ---

const radiusTokens = [
  { name: 'radius-minimal', figma: 'radius/radius-minimal' },
  { name: 'radius-rounded', figma: 'radius/radius-rounded' },
  { name: 'radius-full', figma: 'radius/radius-full' },
];

const RadiusSection = () => (
  <div>
    <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
      Cada componente tem um token de radius atribuído — não escolher por preferência visual. <code style={{ fontFamily: 'monospace' }}>--radius-full</code> está definido no sistema mas sem uso em nenhum componente atual.
    </p>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Figma Variable</TableHead>
          <TableHead>CSS Variable</TableHead>
          <TableHead>Value</TableHead>
          <TableHead>Preview</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {radiusTokens.map(t => (
          <TableRow key={t.name}>
            <TableCell style={{ padding: 'var(--spacing-md) 0', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{t.figma}</TableCell>
            <TableCell style={{ padding: 'var(--spacing-md) 0', fontWeight: 'var(--font-weight-bold)' }}>--{t.name}</TableCell>
            <TableCell style={{ padding: 'var(--spacing-md) 0', fontWeight: 'var(--font-weight-bold)' }}>{getCSSVar(`--${t.name}`)}</TableCell>
            <TableCell style={{ padding: 'var(--spacing-md) 0' }}>
              <div style={{ width: 48, height: 48, background: 'var(--text-primary)', borderRadius: `var(--${t.name})` }} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

/* =========================================
   COMPONENTES
   ========================================= */

const BadgesSection = () => (
  <div>
    <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
      Exclusivo para indicar veredito de condição do mar. Aparece no BeachCard (condição diária) e na BeachPage (condição horária). Não usar como tag de categoria, indicador de status de sistema ou para qualquer finalidade não relacionada ao mar.
    </p>

    <SectionTitle>default — body-bold</SectionTitle>
    <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap', marginBottom: 'var(--spacing-lg)' }}>
      <Badge variant="storm">Storm</Badge>
      <Badge variant="bom">Bom</Badge>
      <Badge variant="marola">Marola</Badge>
      <Badge variant="flat">Flat</Badge>
    </div>

    <SectionTitle>small — subtitle-bold</SectionTitle>
    <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap', marginBottom: 'var(--spacing-lg)' }}>
      <Badge variant="storm" size="small">Storm</Badge>
      <Badge variant="bom" size="small">Bom</Badge>
      <Badge variant="marola" size="small">Marola</Badge>
      <Badge variant="flat" size="small">Flat</Badge>
    </div>

    <SectionTitle>Figma Specs</SectionTitle>
    <div style={{ maxWidth: 500 }}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Prop</TableHead>
            <TableHead>default</TableHead>
            <TableHead>small</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell style={{ color: 'var(--text-secondary)' }}>Font</TableCell>
            <TableCell style={{ fontWeight: 'var(--font-weight-bold)', fontFamily: 'monospace' }}>text-token-body-bold · 14px/700</TableCell>
            <TableCell style={{ fontWeight: 'var(--font-weight-bold)', fontFamily: 'monospace' }}>text-token-subtitle-bold · 11px/700</TableCell>
          </TableRow>
          <TableRow>
            <TableCell style={{ color: 'var(--text-secondary)' }}>Border Radius</TableCell>
            <TableCell style={{ fontWeight: 'var(--font-weight-bold)', fontFamily: 'monospace' }}>var(--radius-minimal) · 8px</TableCell>
          </TableRow>
          <TableRow>
            <TableCell style={{ color: 'var(--text-secondary)' }}>Padding X</TableCell>
            <TableCell style={{ fontWeight: 'var(--font-weight-bold)', fontFamily: 'monospace' }}>var(--spacing-sm) · 8px</TableCell>
          </TableRow>
          <TableRow>
            <TableCell style={{ color: 'var(--text-secondary)' }}>Padding Y</TableCell>
            <TableCell style={{ fontWeight: 'var(--font-weight-bold)', fontFamily: 'monospace' }}>var(--spacing-xs) · 4px</TableCell>
          </TableRow>
          <TableRow>
            <TableCell style={{ color: 'var(--text-secondary)' }}>Border</TableCell>
            <TableCell style={{ fontWeight: 'var(--font-weight-bold)', fontFamily: 'monospace' }}>none</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
);

const ButtonsSection = () => (
  <div>
    <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
      <strong>default</strong> — ação primária ("Aplicar", "Filtrar por data"). <strong>outline</strong> — ação secundária ("Cancelar", setas de navegação de data). <strong>ghost</strong> — ação sem peso visual (back e share no Header). Para <code style={{ fontFamily: 'monospace' }}>size="icon"</code> em ações isoladas, sempre sobrescrever para <code style={{ fontFamily: 'monospace' }}>h-[var(--touch-target)] w-[var(--touch-target)]</code> (44px) — o padrão do shadcn tem 40px.
    </p>
    <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap', alignItems: 'center' }}>
      <Button>Default</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button size="icon" className="rounded-full"><Heart size={16} /></Button>
    </div>
  </div>
);

const InputsSection = () => (
  <div style={{ maxWidth: 320 }}>
    <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
      Exclusivo para busca de praias na HomeScreen. Sempre com ícone <code style={{ fontFamily: 'monospace' }}>Search</code> à esquerda e botão × de limpar quando há texto. Aparece em par com o trigger do DateFilterModal, em <code style={{ fontFamily: 'monospace' }}>flex</code> com o Input ocupando <code style={{ fontFamily: 'monospace' }}>flex: 1</code>.
    </p>
    <div style={{ position: 'relative' }}>
      <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
      <Input className="pl-11 h-12" placeholder="Buscar praia" />
    </div>
  </div>
);

const CardsSection = () => (
  <div style={{ maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
    <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
      Componente de domínio — representa uma praia na lista da HomeScreen. Toque em qualquer área navega para a BeachPage. Não usar para representar outro tipo de conteúdo.
    </p>

    <div>
      <p style={{ fontSize: 'var(--font-size-subtitle)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-sm)' }}>Storm</p>
      <BeachCard
        name="Cacimba do Padre"
        state="PE"
        country="Brasil"
        height="3.5"
        condition="storm"
        label="Storm"
      />
    </div>

    <div>
      <p style={{ fontSize: 'var(--font-size-subtitle)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-sm)' }}>Bom</p>
      <BeachCard
        name="Maracaípe"
        state="PE"
        country="Brasil"
        height="1.5"
        condition="bom"
        label="Bom"
      />
    </div>

    <div>
      <p style={{ fontSize: 'var(--font-size-subtitle)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-sm)' }}>Marola</p>
      <BeachCard
        name="Itapuama"
        state="PE"
        country="Brasil"
        height="0.8"
        condition="marola"
        label="Marola"
      />
    </div>

    <div>
      <p style={{ fontSize: 'var(--font-size-subtitle)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-sm)' }}>Flat</p>
      <BeachCard
        name="Paiva"
        state="PE"
        country="Brasil"
        height="0.3"
        condition="flat"
        label="Flat"
      />
    </div>
  </div>
);

const DayCardSection = () => (
  <div style={{ maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
    <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
      Componente de domínio — representa um dia na lista da aba "Semana" da BeachPage. Título mostra dia da semana + data (via <code style={{ fontFamily: 'monospace' }}>weekdayAndDateLabel</code> de <code style={{ fontFamily: 'monospace' }}>lib/dates.js</code>), Badge de condição à direita. Toque navega para a aba "Dia" com a data daquele card selecionada. Não usar para representar outro tipo de conteúdo — mesma regra de escopo do BeachCard.
    </p>

    <DayCard dateIso={getToday()} condition="bom" label="Bom" />
    <DayCard dateIso={addDays(getToday(), 1)} condition="marola" label="Marola" />
    <DayCard dateIso={addDays(getToday(), 5)} condition="storm" label="Storm" />
    <DayCard dateIso={addDays(getToday(), 6)} condition="flat" label="Flat" />

    <SectionTitle style={{ marginTop: 'var(--spacing-sm)' }}>Loading state</SectionTitle>
    <DayCardSkeleton />
  </div>
);

const TabsSection = () => {
  const [view, setView] = useState('hoje');
  return (
    <div style={{ maxWidth: 400 }}>
      <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
        Segmented control usado no topo da BeachPage para alternar entre a visão "Dia" e "Semana". Construído com <code style={{ fontFamily: 'monospace' }}>@radix-ui/react-tabs</code> (shadcn). Estado ativo usa <code style={{ fontFamily: 'monospace' }}>--surface-secondary</code> + <code style={{ fontFamily: 'monospace' }}>--text-invert</code> — o mesmo par de tokens já usado para "selecionado" no Calendar e no Slider. Sem cor de condição nos tabs.
      </p>
      <Tabs value={view} onValueChange={setView}>
        <TabsList className="w-full h-[var(--touch-target)] p-1 rounded-[var(--radius-rounded)] bg-[var(--surface-terciary)] gap-1">
          <TabsTrigger
            value="hoje"
            className="flex-1 h-full rounded-[var(--radius-rounded)] text-button font-token-bold text-[var(--text-secondary)] data-[state=active]:bg-[var(--surface-secondary)] data-[state=active]:text-[var(--text-invert)]"
          >
            Dia
          </TabsTrigger>
          <TabsTrigger
            value="proximos"
            className="flex-1 h-full rounded-[var(--radius-rounded)] text-button font-token-bold text-[var(--text-secondary)] data-[state=active]:bg-[var(--surface-secondary)] data-[state=active]:text-[var(--text-invert)]"
          >
            Semana
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

const SliderSection = () => {
  const [value, setValue] = useState([50]);

  return (
    <div style={{ maxWidth: 400 }}>
      <SectionTitle>Time Slider</SectionTitle>
      <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
        Exclusivo para scrubbing de hora no TideChart dentro da BeachPage. Range de 0–24h em passos de 1 hora. Renderiza a escala temporal abaixo da track: <code style={{ fontFamily: 'monospace' }}>12am | 6am | 12pm | 6pm | 12am</code>.
      </p>
      <TimeSlider
        value={value[0]}
        onChange={(v) => setValue([v])}
      />
    </div>
  );
};

const IconGroup = ({ title, description, icons }) => (
  <div style={{ marginBottom: 'var(--spacing-lg)' }}>
    <p className="text-token-headline font-token-bold text-[var(--text-primary)]" style={{ marginBottom: 'var(--spacing-xs)' }}>{title}</p>
    {description && (
      <p className="text-token-body text-[var(--text-secondary)]" style={{ marginBottom: 'var(--spacing-md)' }}>{description}</p>
    )}
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
      {icons.map(({ icon: Icon, name, usage }) => (
        <div
          key={name}
          className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-[var(--radius-minimal)]"
          style={{ padding: 'var(--spacing-md)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Icon size={20} className="text-[var(--text-primary)]" />
        </div>
      ))}
    </div>
  </div>
);

const IconesSection = () => (
  <div>
    <SectionTitle>Ícones</SectionTitle>
    <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
      Biblioteca: <strong>lucide-react</strong>. Tamanho padrão: 20px em contexto de conteúdo, 18px dentro de grupos compostos, 22px em botões de navegação. Cor sempre via token — nunca hardcoded. Ícones nunca são decorativos: cada um tem função e contexto definidos.
    </p>

    <IconGroup
      title="Navegação"
      description="Usados em headers, paginação e controles de layout."
      icons={[
        { icon: ChevronLeft,    name: 'ChevronLeft',    usage: 'Voltar / dia anterior' },
        { icon: ChevronRight,   name: 'ChevronRight',   usage: 'Avançar / próximo dia' },
        { icon: Menu,           name: 'Menu',           usage: 'Abrir menu lateral (Header)' },
        { icon: PanelLeft,      name: 'PanelLeft',      usage: 'Recolher sidebar (Design System)' },
        { icon: PanelLeftClose, name: 'PanelLeftClose', usage: 'Expandir sidebar (Design System)' },
      ]}
    />

    <IconGroup
      title="Ações do usuário"
      description="Ações primárias e secundárias disponíveis ao usuário."
      icons={[
        { icon: Heart,        name: 'Heart',        usage: 'Favoritar / desfavoritar praia' },
        { icon: Share,        name: 'Share',        usage: 'Abrir modal de compartilhamento' },
        { icon: Search,       name: 'Search',       usage: 'Campo de busca de praias' },
        { icon: CalendarIcon, name: 'Calendar',     usage: 'Abrir seletor de data' },
        { icon: Check,        name: 'Check',        usage: 'Confirmação de ação (ex: link copiado)' },
        { icon: MapPin,       name: 'MapPin',       usage: 'Localização / geolocalização ativa' },
        { icon: LogOut,       name: 'LogOut',       usage: 'Sair da conta (menu do Header)' },
        { icon: X,            name: 'X',            usage: 'Fechar modal (shadcn/Dialog)' },
      ]}
    />

    <IconGroup
      title="Compartilhamento"
      description="Ícones do modal de compartilhamento da BeachPage."
      icons={[
        { icon: MessageCircle, name: 'MessageCircle', usage: 'WhatsApp' },
        { icon: Camera,        name: 'Camera',        usage: 'Instagram' },
        { icon: Send,          name: 'Send',          usage: 'Telegram' },
        { icon: Mail,          name: 'Mail',          usage: 'E-mail' },
        { icon: ExternalLink,  name: 'ExternalLink',  usage: 'Facebook / X (Twitter)' },
      ]}
    />

    <IconGroup
      title="Dados do mar — InfoBlocks"
      description="Ícones dinâmicos nos InfoBlocks da BeachPage. Variam conforme o dado da hora selecionada no slider."
      icons={[
        { icon: ArrowUp,   name: 'ArrowUp',   usage: 'Maré enchendo (tideLevel > prevTideLevel)' },
        { icon: ArrowDown, name: 'ArrowDown', usage: 'Maré secando (tideLevel ≤ prevTideLevel)' },
        { icon: Wind,      name: 'Wind',      usage: 'Velocidade do vento + direção cardinal (NE, SE…)' },
        { icon: Timer,     name: 'Timer',     usage: 'Período do swell — estático, não varia' },
      ]}
    />

    <IconGroup
      title="Clima — InfoBlock"
      description="Ícone de clima mapeado a partir do WMO weather code retornado pela Open-Meteo, cruzado com isDay (sunrise/sunset do dia). Ausente quando weather code é null."
      icons={[
        { icon: Sun,            name: 'Sun',            usage: 'Céu limpo, dia (code 0–2)' },
        { icon: Moon,           name: 'Moon',           usage: 'Céu limpo, noite (code 0–2)' },
        { icon: Cloud,          name: 'Cloud',          usage: 'Nublado / neblina, dia (code 3–48)' },
        { icon: CloudMoon,      name: 'CloudMoon',      usage: 'Nublado / neblina, noite (code 3–48)' },
        { icon: CloudRain,      name: 'CloudRain',      usage: 'Chuva / garoa, dia (code 49–82)' },
        { icon: CloudMoonRain,  name: 'CloudMoonRain',  usage: 'Chuva / garoa, noite (code 49–82)' },
        { icon: CloudLightning, name: 'CloudLightning', usage: 'Tempestade (code 83+, dia e noite)' },
      ]}
    />

    <IconGroup
      title="Interface"
      description="Ícones de estado e informação."
      icons={[
        { icon: Info,   name: 'Info',   usage: 'Aviso de dado indisponível (tide error)' },
        { icon: Palette, name: 'Palette', usage: 'Seção Fundamentos (Design System)' },
        { icon: ComponentIcon, name: 'Component', usage: 'Seção Componentes / Auth (Design System)' },
      ]}
    />
  </div>
);

const InfoBlockSection = () => (
  <div>
    <SectionTitle>Info Block</SectionTitle>
    <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
      Sempre em grupo de quatro na BeachPage, dispostos em grid 2×2, com labels fixos: <strong>Altura maré</strong>, <strong>Vento</strong>, <strong>Período</strong> e <strong>Clima</strong>. O label aparece acima do valor — o usuário lê primeiro o que é, depois o número. Ícones são dinâmicos: maré (ArrowUp/Down), vento (Wind + direção), período (Timer fixo), clima (Sun/Moon, Cloud/CloudMoon, CloudRain/CloudMoonRain, CloudLightning — variante conforme isDay). Prop <code>icon</code> é um React node opcional — sem ícone, o bloco continua funcional.
    </p>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-sm)', maxWidth: 380 }}>
      <InfoBlock
        label="Altura maré"
        value="2.5m"
        icon={<ArrowUp size={20} />}
      />
      <InfoBlock
        label="Vento"
        value="45 km/h"
        icon={
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Wind size={18} />
            <span className="text-token-subtitle-bold">NE</span>
          </span>
        }
      />
      <InfoBlock
        label="Período"
        value="8s"
        icon={<Timer size={20} />}
      />
      <InfoBlock
        label="Clima"
        value="24°C"
        icon={<Sun size={20} />}
      />
    </div>
    <p style={{ fontSize: 'var(--font-size-subtitle)', color: 'var(--text-secondary)', marginTop: 'var(--spacing-sm)' }}>
      Variante sem ícone (retrocompatível):
    </p>
    <div style={{ display: 'flex', gap: 'var(--spacing-sm)', maxWidth: 380, marginTop: 'var(--spacing-xs)' }}>
      <InfoBlock label="Altura maré" value="—" />
      <InfoBlock label="Clima" value="—" icon={<Cloud size={20} />} />
    </div>
  </div>
);

const StatesSection = () => {
  const box = { border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-minimal)' };
  const caption = { fontSize: 'var(--font-size-subtitle)', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: 'var(--spacing-sm)' };
  return (
    <div style={{ maxWidth: 400 }}>
      <SectionTitle>Estados</SectionTitle>
      <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
        <code style={{ fontFamily: 'monospace' }}>StateMessage</code> cobre vazio e erro: ícone lucide 40px (stroke 1.5), título opcional em body-bold, texto em body e ação opcional com <code style={{ fontFamily: 'monospace' }}>Button variant="outline"</code>. Sempre neutro — cor é só para condição do mar. Use <code style={{ fontFamily: 'monospace' }}>compact</code> dentro de abas ou listas.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
        <div>
          <div style={box}><ErrorState onRetry={() => {}} /></div>
          <p style={caption}>ErrorState — falha de carregamento, sempre com "Tentar de novo"</p>
        </div>
        <div>
          <div style={box}><StateMessage icon={Heart} description="Nenhuma praia favoritada ainda." /></div>
          <p style={caption}>Vazio — Favoritos</p>
        </div>
        <div>
          <div style={box}><StateMessage icon={Search} description="Nenhuma praia encontrada." compact /></div>
          <p style={caption}>Vazio — busca sem resultado</p>
        </div>
      </div>
    </div>
  );
};

const SwellPowerSection = () => (
  <div style={{ maxWidth: 400 }}>
    <SectionTitle>Swell Power Bar</SectionTitle>
    <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
      Barra de 5 segmentos que indica energia do swell em Kj. A cor dos segmentos ativos segue a condição: 1 → flat, 2 → marola, 3–4 → bom, 5 → storm. Segmentos inativos usam <code style={{ fontFamily: 'monospace' }}>--surface-terciary</code>. O label "Força do swell" é fixo; o valor em Kj é exibido à direita.
    </p>

    {/* Todos os estados */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <SwellPowerBar value={1} label="120 Kj" />
      <SwellPowerBar value={2} label="600 Kj" />
      <SwellPowerBar value={3} label="1.440 Kj" />
      <SwellPowerBar value={4} label="2.300 Kj" />
      <SwellPowerBar value={5} label="4.800 Kj" />
    </div>
  </div>
);

const HeaderSection = () => (
  <div style={{ maxWidth: 400 }}>
    <SectionTitle>Header</SectionTitle>
    <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
      Três variantes: <strong>default</strong> exibe só o nome do app; <strong>location</strong> exibe cidade/estado acima do nome do app quando o usuário permite geolocalização; <strong>beach</strong> tem botão back à esquerda, nome da praia centralizado e botão share (ou espaçador de simetria) à direita. Botões de ícone usam <code style={{ fontFamily: 'monospace' }}>h-[var(--touch-target)] w-[var(--touch-target)]</code> (44px). O espaçador mantém o título centralizado quando <code style={{ fontFamily: 'monospace' }}>showShare=false</code>.
    </p>

    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      <div>
        <p style={{ fontSize: 'var(--font-size-subtitle)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-sm)' }}>default — Home (sem localização)</p>
        <div style={{ border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-minimal)', overflow: 'hidden' }}>
          <Header variant="default" />
        </div>
      </div>

      <div>
        <p style={{ fontSize: 'var(--font-size-subtitle)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-sm)' }}>location — Home (com localização ativa)</p>
        <div style={{ border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-minimal)', overflow: 'hidden', marginBottom: 12 }}>
          <Header variant="location" locationLabel="Recife, PE" />
        </div>
        <p style={{ fontSize: 'var(--font-size-subtitle)', color: 'var(--text-secondary)', fontStyle: 'italic' }}>Passando locationLabel="Recife, PE" — exibido quando geolocalização é concedida</p>
      </div>

      <div>
        <p style={{ fontSize: 'var(--font-size-subtitle)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-sm)' }}>beach — Página interna (Dinâmico)</p>
        <div style={{ border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-minimal)', overflow: 'hidden', marginBottom: 12 }}>
          <Header variant="beach" title="Praia do Paiva" />
        </div>
        <p style={{ fontSize: 'var(--font-size-subtitle)', color: 'var(--text-secondary)', fontStyle: 'italic' }}>Passando title="Praia do Paiva" e showShare=false (default)</p>
      </div>

      <div>
        <p style={{ fontSize: 'var(--font-size-subtitle)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-sm)' }}>beach — Com Share Habilitado</p>
        <div style={{ border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-minimal)', overflow: 'hidden', marginBottom: 12 }}>
          <Header variant="beach" title="Itapuama" showShare={true} />
        </div>
        <p style={{ fontSize: 'var(--font-size-subtitle)', color: 'var(--text-secondary)', fontStyle: 'italic' }}>Passando title="Itapuama" e showShare=true</p>
      </div>
    </div>
  </div>
);

const MOCK_TIDES = [
  { hour: '00:30', level: 0.4 },
  { hour: '06:32', level: 2.1 },
  { hour: '12:45', level: 0.3 },
  { hour: '18:58', level: 1.9 },
];

const ModalSection = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
      {/* 1. Modal Nativo Shadcn */}
      <div style={{ maxWidth: 500 }}>
        <SectionTitle>1. Modal Padrão (Dialog Nativo)</SectionTitle>
        <p style={{ fontSize: 'var(--font-size-subtitle)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
          Estrutura padrão do shadcn/ui. Ideal para alertas, confirmações simples ou formulários genéricos.
        </p>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Ver Modal Padrão</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Título do Modal</DialogTitle>
              <DialogDescription>
                Esta é a descrição padrão do modal.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 text-body text-[var(--text-primary)]">
              Aqui vai o conteúdo principal do modal.
            </div>
            <DialogFooter>
              <Button variant="outline">Cancelar</Button>
              <Button>Confirmar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div style={{ height: 1, background: 'var(--border-primary)', width: '100%' }} />

      {/* 2. Modal de Filtro por Data */}
      <div style={{ maxWidth: 500 }}>
        <SectionTitle>2. Modal de Filtro (Componente Real)</SectionTitle>
        <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
          Aceita qualquer elemento como trigger e retorna a data selecionada via callback <code style={{ fontFamily: 'monospace' }}>onApply</code>. Datas disponíveis: hoje até hoje + 7 dias — fora desse range ficam desabilitadas no calendário. O botão "Hoje" fica desabilitado quando hoje já está selecionado.
        </p>

        <DateFilterModal
          initialDate={format(new Date(), 'yyyy-MM-dd')}
          onApply={(date) => alert(`Data aplicada: ${date}`)}
          trigger={<Button>Abrir Filtro de Data</Button>}
        />
      </div>

      <div style={{ height: 1, background: 'var(--border-primary)', width: '100%' }} />

      {/* 3. Modal de Compartilhamento */}
      <ShareModalDemo />

      <div style={{ height: 1, background: 'var(--border-primary)', width: '100%' }} />

      {/* 4. Auth Gate Modal */}
      <AuthGateModalDemo />

    </div>
  );
};

const ShareModalDemo = () => {
  const [open, setOpen] = useState(false);
  const [copyConfirmed, setCopyConfirmed] = useState(false);
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const demoUrl = 'https://ondina.surf/praia/paiva';

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(demoUrl);
      setCopyConfirmed(true);
      setTimeout(() => setCopyConfirmed(false), 2000);
    } catch { /* ignore */ }
  };

  const apps = [
    { label: 'WhatsApp', icon: <MessageCircle size={16} />, href: `https://api.whatsapp.com/send?text=${encodeURIComponent(demoUrl)}`, target: '_blank' },
    { label: 'Telegram', icon: <Send size={16} />, href: `https://t.me/share/url?url=${encodeURIComponent(demoUrl)}`, target: '_blank' },
    { label: 'E-mail', icon: <Mail size={16} />, href: `mailto:?subject=${encodeURIComponent('Ondina')}&body=${encodeURIComponent(demoUrl)}`, target: undefined },
    { label: 'Facebook', icon: <ExternalLink size={16} />, href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(demoUrl)}`, target: '_blank' },
    { label: 'X', icon: <ExternalLink size={16} />, href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(demoUrl)}`, target: '_blank' },
  ];

  return (
    <div style={{ maxWidth: 500 }}>
      <SectionTitle>3. Modal de Compartilhamento</SectionTitle>
      <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
        Ativado pelo botão Share no Header da BeachPage (controlado via estado <code style={{ fontFamily: 'monospace' }}>shareOpen</code> em BeachPage.jsx). Exibe atalhos diretos para os principais apps de compartilhamento + campo com o link e botão de copiar. Funciona igual em mobile e desktop.
      </p>

      <Button variant="outline" onClick={() => setOpen(true)}>Abrir Modal de Share</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[380px] p-6 gap-0 overflow-hidden">
          <DialogHeader className="mb-6">
            <DialogTitle>Compartilhar</DialogTitle>
            <DialogDescription>
              Compartilhe com seus amigos e mostre se vale a pena ir surfar hoje.
            </DialogDescription>
          </DialogHeader>

          <div className="relative flex items-center mb-6 min-w-0">
            {canScrollLeft && (
              <button
                onClick={() => scrollRef.current?.scrollBy({ left: -140, behavior: 'smooth' })}
                className="shrink-0 h-9 w-9 flex items-center justify-center rounded-full border border-[var(--border-primary)] bg-[var(--surface-primary)] hover:bg-[var(--surface-terciary)] transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
            )}
            <div
              ref={(el) => { scrollRef.current = el; if (el) checkScroll(); }}
              onScroll={checkScroll}
              className="flex gap-2 overflow-x-auto scrollbar-none flex-1 min-w-0"
            >
              {apps.map(({ label, icon, href, target }) => (
                <a key={label} href={href} target={target} rel={target ? 'noopener noreferrer' : undefined} className="shrink-0">
                  <Button variant="outline" className="h-[var(--touch-target)] rounded-[var(--radius-rounded)] gap-2 whitespace-nowrap">
                    {icon}{label}
                  </Button>
                </a>
              ))}
            </div>
            {canScrollRight && (
              <button
                onClick={() => scrollRef.current?.scrollBy({ left: 140, behavior: 'smooth' })}
                className="shrink-0 h-9 w-9 flex items-center justify-center rounded-full border border-[var(--border-primary)] bg-[var(--surface-primary)] hover:bg-[var(--surface-terciary)] transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            )}
          </div>

          <div className="h-px bg-[var(--border-primary)] mb-6" />

          <Input
            readOnly
            value={demoUrl}
            className="mb-3 text-[var(--text-secondary)] bg-[var(--surface-terciary)] border-[var(--border-primary)] cursor-default"
            onClick={(e) => e.target.select()}
          />
          <Button
            onClick={handleCopy}
            className="w-full h-12 rounded-[var(--radius-rounded)] gap-2"
          >
            {copyConfirmed ? <><Check size={16} /> Copiado!</> : 'Copiar link'}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const AuthGateModalDemo = () => {
  const { openAuthModal } = useAuth();
  return (
    <div style={{ maxWidth: 500 }}>
      <SectionTitle>4. Auth Modal</SectionTitle>
      <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
        Modal global de autenticação com views de login, cadastro e recuperação de senha.
        Controlado via <code style={{ fontFamily: 'monospace' }}>openAuthModal(view)</code> do AuthContext.
      </p>
      <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
        <Button variant="outline" onClick={() => openAuthModal('login')}>Abrir Login</Button>
        <Button variant="outline" onClick={() => openAuthModal('register')}>Abrir Cadastro</Button>
        <Button variant="outline" onClick={() => openAuthModal('forgot')}>Abrir Recuperação</Button>
      </div>
    </div>
  );
};

const CalendarSection = () => {
  const [date, setDate] = useState(new Date());

  return (
    <div style={{ maxWidth: 400 }}>
      <SectionTitle>Calendar</SectionTitle>
      <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
        Calendário do shadcn/ui (react-day-picker) com classNames customizados alinhados ao design system. Usado exclusivamente dentro do DateFilterModal — não como componente independente no app.
      </p>

      <div style={{ display: 'inline-block', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-rounded)', overflow: 'hidden' }}>
        <Calendar
          mode="single"
          locale={ptBR}
          selected={date}
          onSelect={setDate}
          disabled={{ before: new Date() }}
          className="bg-[var(--surface-primary)]"
        />
      </div>

      <p style={{ marginTop: 'var(--spacing-md)', fontSize: 'var(--font-size-body)', color: 'var(--text-primary)' }}>
        Data selecionada: <strong>{date?.toLocaleDateString('pt-BR')}</strong>
      </p>
    </div>
  );
};

const TideChartSection = () => (
  <div style={{ maxWidth: 400 }}>
    <SectionTitle>Tide Chart</SectionTitle>
    <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
      Renderiza exclusivamente a curva de maré, dots de alta/baixa-mar e a linha vertical da hora atual. Título, label "Maré" e o TimeSlider são responsabilidade do componente pai. Retorna <code style={{ fontFamily: 'monospace' }}>null</code> se <code style={{ fontFamily: 'monospace' }}>tides</code> estiver vazio.
    </p>

    <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-[var(--radius-minimal)] p-[var(--spacing-md)]">
      <span style={{ fontSize: "var(--font-size-subtitle)", color: "var(--text-secondary)", fontWeight: "var(--font-weight-bold)", display: "block", marginBottom: 'var(--spacing-sm)' }}>Maré</span>
      <TideChart tides={MOCK_TIDES} currentHour={14} />
      <div className="mt-6">
        <TimeSlider value={14} onChange={() => { }} />
      </div>
    </div>
  </div>
);

/* =========================================
   AUTH PAGES PREVIEW
   ========================================= */

const AuthPagePreview = ({ title, children }) => (
  <div>
    <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
      Página de auth renderizada em contexto isolado. Navegação e submissão de formulário não funcionam aqui — use o app para testar.
    </p>
    <div style={{
      border: '1px solid var(--border-primary)',
      borderRadius: 'var(--radius-rounded)',
      overflow: 'hidden',
      maxWidth: 480,
    }}>
      {children}
    </div>
  </div>
);

/* =========================================
   SHARED
   ========================================= */

const DropdownMenuSection = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
    <div>
      <SectionTitle>Dropdown Menu</SectionTitle>
      <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
        Menu contextual usado no Header — hamburguer com ações de navegação. Construído com <code style={{ fontFamily: 'monospace' }}>@radix-ui/react-dropdown-menu</code>.
      </p>
      <div style={{ display: 'flex', gap: 'var(--spacing-lg)', flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontSize: 'var(--font-size-subtitle)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-sm)' }}>Com ícones</p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Abrir menu</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem>
                <Heart size={16} />
                Ver favoritos
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share size={16} />
                Compartilhar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  </div>
);

const SectionTitle = ({ children, style: extraStyle }) => (
  <p style={{
    fontSize: 'var(--font-size-body)',
    fontWeight: 'var(--font-weight-bold)',
    color: 'var(--text-secondary)',
    marginBottom: 'var(--spacing-md)',
    ...extraStyle,
  }}>
    {children}
  </p>
);


export default DesignSystem;
